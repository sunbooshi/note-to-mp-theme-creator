---
name: note-to-mp-theme-creator
description: 创建NoteToMP插件的自定义主题
version: 1.0.0
---
## 规范
- 使用less语法
- 需要在`.note-to-mp`类下编写样式
- 使用的样式**必须**能够作为内嵌样式使用
- 默认禁止：
  - margin-left
  - margin-right
  - padding-left
  - padding-right
- 允许：
  - blockquote 左边框产生视觉缩进
  - 列表必要 padding

## 输出格式

最终输出必须满足：

1. 只输出一个Markdown文件
2. 文件内容只能包含一个 Less 代码块
3. 不允许添加说明文字
4. 不允许添加标题
5. 不允许添加多个代码块

正确：

```less
.note-to-mp {
  
}
```

## 强制规则（最高优先级）

以下规则优先级高于所有示例：

### 代码块样式

任何情况下生成 `.code-section` 时：

- 必须完整复制下面结构
- 不允许新增 selector
- 不允许删除 selector
- 只能修改 @变量值


### 图片样式
在微信文章中，图片若超出容器宽度会直接破坏布局。必须强制设置 max-width: 100%。

```less
.note-to-mp {
  img {
    max-width: 100% !important; // 微信环境常需 !important 覆盖默认
    height: auto;
    display: block; // 防止底部空隙
  }
}
```

## 禁止事项

生成主题时禁止：

- 禁止生成 `.note-to-mp` 之外的任何选择器
- 禁止使用 CSS 动画、伪元素复杂装饰
- 禁止使用 position:absolute/fixed
- 禁止使用外部字体、网络资源
- 禁止使用 CSS variables（--xxx）
- 禁止使用 CSS reset
- 禁止覆盖 body、html、*: 等全局选择器
- 禁止添加浏览器私有前缀
- 禁止使用 !important（除非已有示例明确要求）

## 微信兼容性要求

生成CSS必须考虑微信公众号环境：

- 避免使用 grid
- 避免使用 backdrop-filter
- 避免使用 animation
- 避免使用 calc()
- 避免使用 CSS variables
- 避免使用 vh/vw/rem
- 优先使用 px/em

## 语法检查
Skill 根目录（本文件所在目录）记为 $SKILL
- 检查前先确认 Node.js 环境：运行 `node --version`
- 若未安装 Node.js（命令执行失败）：跳过语法检查，直接交付主题，不视为错误
- 若已安装：运行语法检查 `node scripts/lint.js <输出文件>`
  - 若首次运行，需先安装依赖：`npm install`
  - 从项目根目录运行时，脚本路径为 `$SKILL/scripts/lint.js`
  - 可一次传入多个文件或目录
- 检查内容：Less 语法、顶层 selector 是否均以 `.note-to-mp` 开头、是否存在禁止 selector（html/body/:root、顶层 `*`）或禁止 at-rule（@media 等）、是否使用未知变量、`.code-section` 的 AST 结构是否匹配模板
- 通过标准：退出码为 0，且输出中没有 `✘` 行
- 可选 `--strict` 参数：额外执行完整编译（less.render），可发现编译期错误
- 若检查失败，根据报错信息（含行号）修复主题，然后重新检查，直到通过

### 生成前准备（最高优先级）
在构思任何样式之前，**必须**执行以下操作：
1. 读取 `references/variables.md` 获取所有可用变量及说明。
2. 读取 `references/theme-example.md` 理解基础结构。
3. 若未读取以上文件，禁止开始生成主题。

## 主题生成
### 用户提供参考样式情况下的生成流程
1.  总结参考样式中如下内容的样式
	- 标题：文字样式、边框样式、间距
	- 段落：文字样式、间距
	- 列表： marker颜色、文字样式、间距
	- 分割线
	- 引用：文字样式、边框样式、间距
	- 图片、图片标题
	- 文本强调、删除
	- 表格
2.  将总结好的样式**严格**按照规范，参考示例CSS输出为markdown格式
3.  按「语法检查」一节对输出文件执行语法检查

### 用户未提供参考样式情况下的生成流程
1.  理解用户的需求，生成核心的主题颜色
2.  只生成用户要求的样式
3.  **严格**按照规范，参考示例CSS输出为markdown格式
4.  按「语法检查」一节对输出文件执行语法检查

## 最终检查

生成完成后确认：

- [ ] 所有LESS都在 `.note-to-mp` 内
- [ ] 输出只有一个less代码块
- [ ] 没有新增class
- [ ] 没有未定义变量(变量必须在 [variables.md](references/variables.md) 中定义)
- [ ] 没有全局选择器
- [ ] code-section结构未改变
- [ ] 若安装了Node.js已执行lint


## 主题设计原则

生成主题时：

1. 标题应该作为视觉中心
2. 正文保持高可读性
3. 不使用过多颜色
4. 强调元素使用主题色
5. 引用、代码块、表格保持统一视觉语言
6. 避免过度装饰

## 参考
- 完整的文章主题 [theme-full.md](references/theme-full.md) 
- 文章主题变量 [variables.md](references/variables.md)
- 文章主题示例 [theme-example.md](references/theme-example.md)
- 基础主题 [theme-basic.md](references/theme-basic.md) 
- 列表 [list.md](references/list.md)
- 标题 [headline.md](references/headline.md)
- 居中 [align_center.md](references/align-center.md)
- 常见问题 [faq.md](references/faq.md)
