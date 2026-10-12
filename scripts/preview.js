#!/usr/bin/env node
/**
 * preview.js
 *
 * 生成 NoteToMP 主题预览页面：
 *   1. 以 references/theme-full.md 作为基础样式（提取其中的 ```less 代码块）
 *   2. 若用户提供了自定义样式（.less 文件，或含 ```less 代码块的 .md 文件），
 *      编译后追加到基础样式之后，用于覆盖基础样式
 *   3. 使用 Less 编译，并把 CSS 内嵌到 HTML 的 <style> 中
 *   4. HTML 正文使用 scripts/template.html 的内容
 *
 * 用法：
 *   node preview.js                        # 仅使用基础样式预览
 *   node preview.js theme.less             # 基础样式 + 用户样式
 *   node preview.js theme.md -o out.html   # 指定输出文件
 *   node preview.js theme.less --open      # 生成后用浏览器打开
 *   node preview.js --base other.md --no-user
 *
 * 参数：
 *   <file...>            用户自定义样式文件（.less 或 .md），可传多个，按顺序覆盖
 *   -o, --output <file>  输出 HTML 路径，默认 preview.html
 *   -b, --base <file>    基础样式文件，默认 references/theme-full.md
 *   -t, --template <f>   正文模板文件，默认 scripts/template.html
 *   --no-user            忽略用户样式，只预览基础样式
 *   --open               生成后用系统默认浏览器打开
 *   -h, --help           显示帮助
 *
 * 退出码：0 = 成功，1 = 失败
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const less = require('less');

const SCRIPT_DIR = __dirname;
const SKILL_DIR = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_BASE = path.join(SKILL_DIR, 'references', 'theme-full.md');
const DEFAULT_TEMPLATE = path.join(SCRIPT_DIR, 'template.html');

const USAGE = `用法:
  node preview.js [选项] [用户样式文件...]

选项:
  -o, --output <file>    输出 HTML 路径（默认 preview.html）
  -b, --base <file>      基础样式文件（默认 references/theme-full.md）
  -t, --template <file>  正文模板文件（默认 scripts/template.html）
      --no-user          忽略用户样式，仅预览基础样式
      --open             生成后用系统默认浏览器打开
  -h, --help             显示本帮助

说明:
  基础样式取自 \`--base\` 文件中的 \`\`\`less 代码块（若是 .md），
  用户样式文件也支持 .less 或含 \`\`\`less 代码块的 .md，
  用户样式编译后的 CSS 会内嵌在基础样式之后，用于覆盖基础样式。

示例:
  node preview.js
  node preview.js theme.less
  node preview.js theme.less -o preview.html --open
`;

// ---------- 参数解析 ----------

function parseArgs(argv) {
  const opts = {
    userFiles: [],
    output: 'preview.html',
    base: DEFAULT_BASE,
    template: DEFAULT_TEMPLATE,
    noUser: false,
    open: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') {
      console.log(USAGE);
      process.exit(0);
    } else if (a === '-o' || a === '--output') {
      opts.output = argv[++i];
    } else if (a === '-b' || a === '--base') {
      opts.base = argv[++i];
    } else if (a === '-t' || a === '--template') {
      opts.template = argv[++i];
    } else if (a === '--no-user') {
      opts.noUser = true;
    } else if (a === '--open') {
      opts.open = true;
    } else if (a.startsWith('-')) {
      fail(`未知参数：${a}\n\n${USAGE}`);
    } else {
      opts.userFiles.push(a);
    }
  }
  if (!opts.output) fail('缺少 --output 的值');
  return opts;
}

function fail(msg) {
  console.error(`✘ ${msg}`);
  process.exit(1);
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
      const content = [];
      i += 1;
      // 外层包装块（````less 里再嵌 ```less）：跳过外层，让内层块单独提取
      if (i < lines.length && /^\s*(`{3,}|~{3,})\s*\S*\s*$/.test(lines[i])) {
        continue;
      }
      while (i < lines.length) {
        const c = lines[i].match(/^\s*(`{3,}|~{3,})\s*$/);
        if (c && c[1][0] === fenceChar && c[1].length >= fenceLen) {
          i += 1;
          break;
        }
        content.push(lines[i]);
        i += 1;
      }
      blocks.push(content.join('\n'));
    } else {
      i += 1;
    }
  }
  return blocks;
}

/**
 * 读取样式文件内容：
 * - .md 文件提取其中的 ```less 代码块（多个块按顺序拼接）
 * - 其它文件（.less 等）直接作为 Less 源码
 */
function readStyleSource(file) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) fail(`样式文件不存在：${abs}`);
  const source = fs.readFileSync(abs, 'utf8');
  if (/\.md$/i.test(abs)) {
    const blocks = extractLessBlocks(source);
    if (blocks.length === 0) fail(`未在 Markdown 中找到 \`\`\`less 代码块：${abs}`);
    return blocks.join('\n\n');
  }
  return source;
}

/**
 * 从基础样式中截取顶部的变量声明块，
 * 作为用户样式编译时的变量作用域（保证用户样式可引用基础变量）。
 */
function extractVariableScope(baseLess) {
  const marker = baseLess.search(/\.note-to-mp\b/);
  return marker > 0 ? baseLess.slice(0, marker) : '';
}

// ---------- 编译 ----------

async function compile(source, label) {
  try {
    const { css } = await less.render(source, { filename: label, compress: false });
    return css;
  } catch (err) {
    const parts = [];
    if (err.line) parts.push(`第 ${err.line} 行`);
    if (err.column) parts.push(`第 ${err.column} 列`);
    let msg = err.message || String(err);
    if (parts.length) msg += `（${parts.join('，')}）`;
    if (err.extract) msg += '\n    ' + err.extract.join('\n    ');
    fail(`Less 编译失败 [${label}]：${msg}`);
  }
}

// ---------- 生成 HTML ----------

function buildHtml({ baseCss, userCss, templateHtml }) {
  const userBlock = userCss
    ? `\n<style data-theme="user">\n/* ===== 用户自定义样式（覆盖基础样式） ===== */\n${userCss}\n</style>\n`
    : '';
  const htmlDoc = templateHtml.includes('<html')
    ? templateHtml
    : `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NoteToMP 主题预览</title>
<style>/* ===== 基础样式：theme-full.md ===== */\n${baseCss}\n</style>${userBlock}
<style data-theme="preview">
/* ===== 预览页面容器（不作用于文章内样式） ===== */
html, body { margin: 0; padding: 0; }
body { background: #f2f3f5; }
.preview-wrap {
  box-sizing: border-box;
  max-width: 677px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 24px 16px 64px;
  background: #ffffff;
}
@media (max-width: 720px) {
  .preview-wrap { padding: 16px 12px 48px; }
}
</style>
</head>
<body>
<div class="preview-wrap">
${templateHtml}
</div>
</body>
</html>
`;
  return htmlDoc;
}

// ---------- 打开浏览器 ----------

function openInBrowser(file) {
  const abs = path.resolve(file);
  let cmd;
  let args;
  if (process.platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '', abs];
  } else if (process.platform === 'darwin') {
    cmd = 'open';
    args = [abs];
  } else {
    cmd = 'xdg-open';
    args = [abs];
  }
  const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
  child.on('error', () => console.warn(`⚠ 无法自动打开浏览器，请手动打开：${abs}`));
  child.unref();
}

// ---------- 主流程 ----------

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  // 1. 基础样式
  const baseSource = readStyleSource(opts.base);
  const baseCss = await compile(baseSource, path.resolve(opts.base));

  // 2. 用户样式（可选，编译后追加，用于覆盖基础样式）
  let userCss = '';
  const userFiles = opts.noUser ? [] : opts.userFiles;
  if (userFiles.length > 0) {
    const varScope = extractVariableScope(baseSource);
    const chunks = [];
    for (const file of userFiles) {
      const source = readStyleSource(file);
      chunks.push(`/* 来源：${file} */\n${source}`);
    }
    const userSource = `${varScope}\n${chunks.join('\n\n')}`;
    userCss = await compile(userSource, userFiles.join(', '));
  }

  // 3. 正文模板
  const templatePath = path.resolve(opts.template);
  if (!fs.existsSync(templatePath)) fail(`模板文件不存在：${templatePath}`);
  const templateHtml = fs.readFileSync(templatePath, 'utf8').trim();

  // 4. 输出 HTML
  const html = buildHtml({ baseCss, userCss, templateHtml });
  const outPath = path.resolve(opts.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');

  console.log(`✔ 预览已生成：${outPath}`);
  console.log(`  基础样式：${path.resolve(opts.base)}`);
  if (userFiles.length > 0) {
    console.log(`  用户样式：${userFiles.map((f) => path.resolve(f)).join('、')}`);
  } else {
    console.log('  用户样式：（无）');
  }
  console.log(`  文件大小：${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(1)} KB`);

  if (opts.open) openInBrowser(outPath);
}

main().catch((err) => fail(err && err.stack ? err.stack : String(err)));
