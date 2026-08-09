#!/usr/bin/env node
/**
 * lint.js
 *
 * 检查 article-theme-skill 生成的主题（.less 文件或含 ```less 代码块的 .md 文件）：
 *   1. Less 语法
 *   2. NoteToMP CSS AST 规范：
 *      - 顶层 selector 是否全部以 .note-to-mp 开头
 *      - 是否存在禁止 selector（html/body/:root、顶层 *）或禁止 at-rule（@media 等）
 *      - 是否使用未知变量
 *      - .code-section 的 AST 结构是否匹配模板
 *
 * 用法：
 *   node lint.js                     # 默认递归检查当前目录下的 *.less / *.md
 *   node lint.js <file|dir|glob>...  # 检查指定文件/目录/通配符
 *   node lint.js --strict <...>      # 严格模式：额外执行完整编译（less.render）
 *   node lint.js --help
 *
 * 退出码：0 = 全部通过，1 = 存在错误
 */
'use strict';

const fs = require('fs');
const path = require('path');
const less = require('less');

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);
const STRICT = process.argv.includes('--strict');

const USAGE = `用法:
  node lint.js [--strict] [<file|dir|glob>...]

  --strict      严格模式：额外执行完整编译（可发现编译期错误）
  不带路径时    递归检查当前目录下的 *.less 和 *.md

检查内容:
  1. Less 语法
  2. 顶层 selector 均以 .note-to-mp 开头
  3. 禁止 selector（html/body/:root、顶层 *）与禁止 at-rule（@media/@import 等）
  4. 未知变量
  5. .code-section AST 是否匹配模板

示例:
  node lint.js theme.less
  node lint.js generated-theme.md
  node lint.js "*.less" "*.md"
  node lint.js --strict theme.less
`;

// ---------- 规范配置 ----------

// 禁止的页面级 selector（会逃出文章容器）
const FORBIDDEN_SELECTORS = [/^(html|body|:root)$/i];
// 顶层禁止的通用 selector
const FORBIDDEN_TOP_LEVEL_SELECTORS = [/^\*$/];
// 禁止的 at-rule（内嵌样式无法使用）
const FORBIDDEN_AT_RULES = ['@media', '@keyframes', '@font-face', '@import', '@charset', '@supports', '@page'];
const FORBIDDEN_AT_RULE_TYPES = new Set(['Media', 'Import', 'Charset', 'Keyframes', 'FontFace', 'Page', 'Supports']);

// 变量定义数达到该值时视为“完整主题”，强制要求 .note-to-mp 与 .code-section
// （references/SKILL.md 中的局部示例片段不满足该阈值，不会被误判）
const MIN_VARS_FOR_FULL_THEME = 3;

// .code-section 模板：必填属性、关键取值、子规则
const CODE_SECTION_SPEC = {
  requiredProps: ['display', 'border', 'margin', 'line-height', 'padding', 'font-family'],
  valueChecks: [
    { prop: 'display', expected: 'flex', test: (v) => /flex/i.test(v) },
  ],
  children: {
    pre: {
      requiredProps: ['margin', 'margin-block-start', 'margin-block-end', 'white-space', 'overflow-x', 'padding'],
      valueChecks: [
        { prop: 'white-space', expected: 'normal', test: (v) => /normal/i.test(v) },
        { prop: 'overflow-x', expected: 'auto', test: (v) => /auto/i.test(v) },
      ],
    },
    code: {
      requiredProps: ['display', 'text-wrap', 'font-family'],
      valueChecks: [
        { prop: 'display', expected: 'flex', test: (v) => /flex/i.test(v) },
        { prop: 'text-wrap', expected: 'nowrap', test: (v) => /nowrap/i.test(v) },
      ],
    },
    ul: {
      requiredProps: ['margin', 'padding', 'margin-block-start', 'margin-block-end', 'width', 'flex-shrink', 'height', 'line-height', 'list-style-type'],
      valueChecks: [
        { prop: 'width', expected: 'fit-content', test: (v) => /fit-content/i.test(v) },
        { prop: 'flex-shrink', expected: '0', test: (v) => /^0$/i.test(v.trim()) },
        { prop: 'list-style-type', expected: 'none', test: (v) => /none/i.test(v) },
      ],
      children: {
        '> li': {
          requiredProps: ['text-align'],
          valueChecks: [
            { prop: 'text-align', expected: 'right', test: (v) => /right/i.test(v) },
          ],
        },
      },
    },
  },
};

// ---------- 文件收集 ----------

function hasMagic(p) {
  return /[*?[\]]/.test(p);
}

function makeMatcher(pattern) {
  const norm = pattern.replace(/\\/g, '/');
  let re = '';
  let i = 0;
  while (i < norm.length) {
    const ch = norm[i];
    if (ch === '*') {
      if (norm[i + 1] === '*') {
        i += 2;
        if (norm[i] === '/') {
          re += '(?:.*/)?';
          i += 1;
        } else {
          re += '.*';
        }
      } else {
        re += '[^/]*';
        i += 1;
      }
    } else if (ch === '?') {
      re += '[^/]';
      i += 1;
    } else if (ch === '[') {
      const end = norm.indexOf(']', i);
      if (end === -1) {
        re += '\\[';
        i += 1;
      } else {
        re += norm.slice(i, end + 1);
        i = end + 1;
      }
    } else {
      re += ch.replace(/[.+^${}()|\\]/g, '\\$&');
      i += 1;
    }
  }
  return new RegExp('^' + re + '$');
}

function walk(dir, onFile) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!IGNORE_DIRS.has(ent.name)) walk(full, onFile);
    } else if (ent.isFile()) {
      onFile(full);
    }
  }
}

function collectFiles(args) {
  const found = new Set();
  const push = (p) => found.add(path.resolve(p));
  const cwd = process.cwd();

  if (args.length === 0) {
    walk(cwd, (p) => {
      if (/\.(less|md)$/i.test(p)) push(p);
    });
    return [...found].sort();
  }

  for (const arg of args) {
    if (hasMagic(arg)) {
      const abs = path.resolve(arg);
      const norm = abs.replace(/\\/g, '/');
      const magicIdx = norm.search(/[*?[]/);
      const cut = norm.lastIndexOf('/', magicIdx);
      const root = cut <= 0 ? path.parse(abs).root : norm.slice(0, cut).replace(/\//g, path.sep);
      const matcher = makeMatcher(norm);
      walk(root, (p) => {
        if (matcher.test(p.replace(/\\/g, '/'))) push(p);
      });
    } else if (fs.existsSync(arg)) {
      const st = fs.statSync(arg);
      if (st.isDirectory()) {
        walk(path.resolve(arg), (p) => {
          if (/\.(less|md)$/i.test(p)) push(p);
        });
      } else {
        push(arg);
      }
    } else {
      console.warn(`[warn] 路径不存在，已跳过: ${arg}`);
    }
  }
  return [...found].sort();
}

// ---------- Markdown 中提取 less 代码块 ----------

function extractLessBlocks(mdSource) {
  const lines = mdSource.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^\s*(`{3,}|~{3,})\s*([A-Za-z0-9_-]*)\s*$/);
    if (m && m[2].toLowerCase() === 'less') {
      const fenceChar = m[1][0];
      const fenceLen = m[1].length;
      const startLine = i + 1;
      const content = [];
      i += 1;
      // 外层包装块（````less 里再嵌 ```less）：跳过外层，让内层块单独提取
      if (i < lines.length && /^\s*(`{3,}|~{3,})\s*\S*\s*$/.test(lines[i])) {
        continue;
      }
      let closed = false;
      while (i < lines.length) {
        const c = lines[i].match(/^\s*(`{3,}|~{3,})\s*$/);
        if (c && c[1][0] === fenceChar && c[1].length >= fenceLen) {
          closed = true;
          i += 1;
          break;
        }
        content.push(lines[i]);
        i += 1;
      }
      blocks.push({ content: content.join('\n'), startLine, closed });
    } else {
      i += 1;
    }
  }
  return blocks;
}

// ---------- Less AST 工具 ----------

const SKIP_WALK_KEYS = new Set([
  'parent', 'rootNode', 'fileInfo', 'currentFileInfo', '_fileInfo',
  'functionRegistry', 'originalRuleset', '_lookups', '_variables',
  '_properties', '_rulesets', 'paths', 'debugInfo', 'visibilityBlocks',
  'nodeVisible', 'parsed', 'firstRoot', 'allowRoot', 'strictImports',
  'evalFirst', 'isReferenced', 'isRuleset',
]);

function walkAll(node, fn, seen) {
  if (!node || typeof node !== 'object') return;
  seen = seen || new WeakSet();
  if (seen.has(node)) return;
  seen.add(node);
  if (Array.isArray(node)) {
    for (const c of node) walkAll(c, fn, seen);
    return;
  }
  fn(node);
  for (const key of Object.keys(node)) {
    if (SKIP_WALK_KEYS.has(key)) continue;
    const v = node[key];
    if (v && typeof v === 'object') walkAll(v, fn, seen);
  }
}

function selectorCss(sel) {
  try {
    return String(sel.toCSS({ compress: false }) || '').trim();
  } catch {
    return '';
  }
}

function declName(decl) {
  if (typeof decl.name === 'string') return decl.name;
  if (Array.isArray(decl.name) && decl.name[0] && typeof decl.name[0].value === 'string') {
    return decl.name[0].value;
  }
  if (decl.name && typeof decl.name.value === 'string') return decl.name.value;
  return String(decl.name || '');
}

function declValueCss(decl) {
  try {
    return decl.value ? String(decl.value.toCSS({ compress: false }) || '') : '';
  } catch {
    return '';
  }
}

function containsVariable(node) {
  let found = false;
  walkAll(node, (n) => {
    if (n.type === 'Variable') found = true;
  });
  return found;
}

function lineOf(node, input) {
  if (node && typeof node.index === 'number' && input) {
    return input.slice(0, node.index).split('\n').length;
  }
  return null;
}

// ---------- AST 规范检查 ----------

function collectRulesets(rules, depth, out) {
  for (const r of rules) {
    if (r.type === 'Ruleset') {
      out.push({ node: r, depth });
      if (Array.isArray(r.rules)) collectRulesets(r.rules, depth + 1, out);
    }
  }
}

function childRulesets(node) {
  const map = new Map();
  for (const r of node.rules || []) {
    if (r.type !== 'Ruleset') continue;
    for (const sel of r.selectors || []) {
      const css = selectorCss(sel);
      if (css) map.set(css, r);
    }
  }
  return map;
}

function collectProps(node) {
  const props = new Set();
  for (const r of node.rules || []) {
    if (r.type === 'Declaration' && !r.variable) props.add(declName(r).toLowerCase());
  }
  return props;
}

function findDecl(node, prop) {
  for (const r of node.rules || []) {
    if (r.type === 'Declaration' && !r.variable && declName(r).toLowerCase() === prop) return r;
  }
  return null;
}

function checkTemplate(ruleset, label, spec, issues) {
  const props = collectProps(ruleset);
  for (const p of spec.requiredProps) {
    if (!props.has(p)) issues.push({ msg: `${label} 缺少必填属性 "${p}"`, node: ruleset });
  }
  for (const vc of spec.valueChecks || []) {
    const decl = findDecl(ruleset, vc.prop);
    if (decl && !containsVariable(decl.value)) {
      const v = declValueCss(decl);
      if (v && !vc.test(v)) {
        issues.push({ msg: `${label} 的 ${vc.prop} 应为 "${vc.expected}"，当前为 "${v}"`, node: decl });
      }
    }
  }
  const children = childRulesets(ruleset);
  for (const [childSel, childSpec] of Object.entries(spec.children || {})) {
    const child = children.get(childSel);
    if (!child) {
      issues.push({ msg: `${label} 缺少子规则 "${childSel}"`, node: ruleset });
      continue;
    }
    checkTemplate(child, `${label} ${childSel}`, childSpec, issues);
  }
}

function runAstChecks(tree, input) {
  const issues = [];
  const push = (msg, node) => issues.push({ msg, node });

  const allRulesets = [];
  collectRulesets(tree.rules || [], 0, allRulesets);

  // 1. 顶层 selector 必须以 .note-to-mp 开头
  for (const rs of allRulesets) {
    if (rs.depth !== 0) continue;
    for (const sel of rs.node.selectors || []) {
      const css = selectorCss(sel);
      if (css && !css.startsWith('.note-to-mp')) {
        push(`顶层 selector 必须以 .note-to-mp 开头，发现 "${css}"`, rs.node);
      }
    }
  }

  // 2. 禁止 selector
  for (const rs of allRulesets) {
    for (const sel of rs.node.selectors || []) {
      const css = selectorCss(sel);
      if (!css) continue;
      if (FORBIDDEN_SELECTORS.some((re) => re.test(css))) {
        push(`禁止使用 selector "${css}"`, rs.node);
      }
      if (rs.depth === 0 && FORBIDDEN_TOP_LEVEL_SELECTORS.some((re) => re.test(css))) {
        push(`禁止在顶层使用通配 selector "${css}"`, rs.node);
      }
    }
  }

  // 3. 禁止 at-rule（内嵌样式无法使用）
  (function scanAtRules(rules) {
    for (const r of rules) {
      if (!r || typeof r !== 'object') continue;
      const type = r.type || '';
      const name = String(r.name || '').toLowerCase();
      const forbidden =
        FORBIDDEN_AT_RULE_TYPES.has(type) ||
        FORBIDDEN_AT_RULES.some((a) => name.startsWith(a));
      if (forbidden) {
        push(`禁止使用 at-rule "${name || type}"（内嵌样式无法使用）`, r);
      }
      if (Array.isArray(r.rules)) scanAtRules(r.rules);
    }
  })(tree.rules || []);

  // 4. 变量收集与未知变量检查
  const defined = new Set();
  const referenced = new Set();
  walkAll(tree, (n) => {
    if (n.type === 'Declaration' && n.variable) {
      const m = String(declName(n)).match(/^(@[\w-]+)/);
      if (m) defined.add(m[1]);
    } else if (n.type === 'Variable') {
      referenced.add(n.name);
    }
  });
  const isFullTheme = defined.size >= MIN_VARS_FOR_FULL_THEME;
  if (defined.size > 0) {
    for (const v of [...referenced].sort()) {
      if (!defined.has(v)) push(`使用了未知变量 ${v}`, null);
    }
  }

  // 5. 完整主题必须包含 .note-to-mp 根 selector 与 .code-section
  const hasNoteToMpRoot = allRulesets.some((rs) =>
    (rs.node.selectors || []).some((s) => selectorCss(s) === '.note-to-mp')
  );
  if (isFullTheme && !hasNoteToMpRoot) {
    push('完整主题缺少 .note-to-mp 根 selector', null);
  }

  const codeSections = allRulesets.filter((rs) =>
    (rs.node.selectors || []).some((s) => selectorCss(s) === '.code-section')
  );
  if (isFullTheme && codeSections.length === 0) {
    push('完整主题缺少 .code-section（代码块模板）', null);
  }
  for (const rs of codeSections) {
    checkTemplate(rs.node, '.code-section', CODE_SECTION_SPEC, issues);
  }

  return issues;
}

// ---------- 检查入口 ----------

async function lintSource({ code, lineOffset }, label) {
  const offset = lineOffset || 0;
  const input = offset > 0 ? '\n'.repeat(offset) + code : code;
  try {
    const tree = await less.parse(input, { filename: label });
    const issues = runAstChecks(tree, input).map((it) => {
      // Ruleset 等节点的 index 恒为 0，只有带真实偏移的节点（如 Declaration/Media）才附行号
      const line =
        it.node && typeof it.node.index === 'number' && it.node.index > 0
          ? lineOf(it.node, input)
          : null;
      return { msg: line ? `${it.msg}（第 ${line} 行）` : it.msg };
    });
    if (STRICT) {
      try {
        await less.render(input, { filename: label });
      } catch (err) {
        issues.push({ msg: formatError(err) });
      }
    }
    // 去重
    const seen = new Set();
    const unique = issues.filter((it) => {
      const k = it.msg;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return { ok: unique.length === 0, issues: unique };
  } catch (err) {
    return { ok: false, issues: [{ msg: formatError(err) }] };
  }
}

function formatError(err) {
  const parts = [];
  if (err.line) parts.push(`第 ${err.line} 行`);
  if (err.column) parts.push(`第 ${err.column} 列`);
  let out = err.message || String(err);
  if (parts.length) out += ` (${parts.join('，')})`;
  if (err.extract && err.extract.length) {
    out += '\n    ' + err.extract.join('\n    ');
  }
  return out;
}

// ---------- 主流程 ----------

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(USAGE);
    process.exit(0);
  }

  const args = process.argv.slice(2).filter((a) => a !== '--strict');
  const files = collectFiles(args);

  if (files.length === 0) {
    console.log('未找到可检查的文件（.less 或包含 ```less 块的 .md）。');
    process.exit(0);
  }

  console.log(STRICT ? '严格模式（语法 + AST 规范 + 完整编译）' : '语法 + NoteToMP AST 规范检查');
  let checked = 0;
  let blocksTotal = 0;
  let errors = 0;
  let skipped = 0;

  for (const file of files) {
    const rel = path.relative(process.cwd(), file) || file;
    const ext = path.extname(file).toLowerCase();
    let source;
    try {
      source = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    } catch (e) {
      console.warn(`[warn] 无法读取 ${rel}: ${e.message}`);
      skipped += 1;
      continue;
    }

    if (ext === '.less') {
      checked += 1;
      blocksTotal += 1;
      const r = await lintSource({ code: source }, rel);
      if (r.ok) {
        console.log(`✔ ${rel}`);
      } else {
        errors += 1;
        console.log(`✘ ${rel}`);
        for (const it of r.issues) console.log('  ' + it.msg.replace(/\n/g, '\n  '));
      }
      continue;
    }

    if (ext === '.md') {
      const blocks = extractLessBlocks(source);
      if (blocks.length === 0) {
        skipped += 1;
        console.log(`- ${rel}（未找到 less 代码块，跳过）`);
        continue;
      }
      checked += 1;
      for (let b = 0; b < blocks.length; b += 1) {
        const block = blocks[b];
        blocksTotal += 1;
        const label = `${rel} · less 块 ${b + 1}（第 ${block.startLine} 行起）`;
        const r = await lintSource(
          { code: block.content, lineOffset: block.startLine },
          label
        );
        if (r.ok) {
          console.log(`✔ ${label}`);
        } else {
          errors += 1;
          console.log(`✘ ${label}`);
          for (const it of r.issues) console.log('  ' + it.msg.replace(/\n/g, '\n  '));
        }
      }
      continue;
    }

    skipped += 1;
    console.log(`- ${rel}（不是 .less/.md，跳过）`);
  }

  const suffix = skipped ? `，${skipped} 个跳过` : '';
  console.log(`\n检查完成：${checked} 个文件 / ${blocksTotal} 个 less 片段，${errors} 个错误${suffix}。`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
