``` less
// 字体
@font-family: Optima, Optima-regular, "Microsoft YaHei", PingFangSC-regular, serif;
@title-font-family: @font-family;
@code-font-family: Menlo-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;

// 字体大小
@font-size: 16px;
@line-height: 1.6em;
@h1-font-size: 1.5em;
@h2-font-size: 1.3em;
@h3-font-size: 1.1em;
@h4-font-size: 1em;
@h5-font-size: 1em;
@h6-font-size: 1em;
@table-font-size: 1em;

// 字体粗细
@title-font-weight: 600;
@bold-font-weight: bold;
@italic-font-style: italic;
@h1-font-weight: bold;
@h2-font-weight: bold;
@h3-font-weight: bold;
@h4-font-weight: bold;
@h5-font-weight: bold;
@h6-font-weight: bold;

// 容器间距
@md-body-mg-h: 0;
@md-body-mg-v: 0;
@md-body-pd-h: 0;
@md-body-pd-v: 0;

// 间距
@block-mg-v: 0.75em; 
@blockquote-mg-h: 0;
@li-mg-t: .25em;

// 颜色
@primary-color: #353535;
@font-color: #222222;
@del-font-color: #525252;
@head-color: #262626;
@link-color: #2478c5;
@code-font-color: #424242;

@body-bg-color: white;
@mark-bg-color: #fcffc0;
@code-bg-color: white;

@border-color: #bfbfbf;

// 链接，分割线
@link-decoration: none;
@hr-bd-style: inset;
@hr-bd-width: 1px;

// 表格
@table-border-spacing: 2px;
@table-font-color: @code-font-color;
@table-bg-color: @code-bg-color;

// 代码块
@code-line-height: 26px;
@code-section-padding: 0.5em;
@code-section-pre-padding-left: 1em;

.note-to-mp {
  font-size: @font-size;
  color: @font-color;
  background-color: @body-bg-color;
  line-height: @line-height;
  margin: @md-body-mg-v @md-body-mg-h;
  padding: @md-body-pd-v @md-body-pd-h;

  // 边距
  p, pre, blockquote, table, figure {
    margin: @block-mg-v 0 (@block-mg-v * 0.6); // Less 计算建议加括号
  }

  hr {
    margin: @block-mg-v auto;
  }

  // 标题
  h1, h2, h3, h4, h5, h6 {
    margin-top: 2 * @block-mg-v;
    margin-bottom: @block-mg-v;
    margin-left: 0;
    margin-right: 0;
    font-weight: @title-font-weight;
    line-height: 1.5em;
    color: @head-color;
  }

  h1 { font-size: @h1-font-size; }
  h2 { font-size: @h2-font-size; }
  h3 { font-size: @h3-font-size; }
  h4 { font-size: @h4-font-size; }
  h5 { font-size: @h5-font-size; }
  h6 { font-size: @h6-font-size; }

  // 分割线
  hr {
    height: 1px;
    border: 0;
    background-color: @border-color;
    border-style: @hr-bd-style;
    border-width: @hr-bd-width;
  }

  // 段落
  p {
    margin-left: 0;
    margin-right: 0;
  }

  pre {
    padding: 0;
    border: 0;
  }

  // 引用
  blockquote {
    display: block;
    padding-left: 0.8em;
    border-left: 0.2em solid @primary-color;
    color: @font-color;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  // 列表
  li {
    word-wrap: break-all;
  }

  ul {
    margin-left: 1.3em;
    padding: 0;
  }

  li::marker {
    color: @primary-color;
  }

  li > p {
    margin: 0;
  }

  ol {
    padding-left: 1.3em;
    list-style-type: decimal;
  }

  // 图片
  img {
    max-width: 100%;
    height: auto;
  }

  u {
    text-decoration: none;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, @primary-color 50%);
    background-repeat: repeat-x;
    background-size: 2px 2px;
    background-position: 0 1em;
  }

  a {
    color: @link-color;
    text-decoration: @link-decoration;

    img {
      border: none;
    }
  }

  b, strong {
    font-weight: @bold-font-weight;
  }

  i, em {
    font-style: @italic-font-style;
  }

  del, s {
    color: @del-font-color;
  }

  pre, code {
    font-family: @code-font-family;
  }

  mark {
    color: inherit;
    display: inline;
    padding: 0.2em 0.5em;
    background-color: @mark-bg-color;
  }

  // 图片标题
  figcaption {
    text-align: center;
  }

  // 表格
  table {
    color: @table-font-color;
    border-collapse: collapse;
    background-color: @table-bg-color;
    border-spacing: @table-border-spacing;
    font-size: @table-font-size;
    border: 1px;
    border-spacing: 0;
  }

  th, td {
    padding: 0.7em 1em;
    font-size: 0.9em;
    border: 1px solid @border-color;
  }

  caption, th, td {
    text-align: left;
    font-weight: normal;
    vertical-align: middle;
  }

  // 脚注
  .footnotes > ol li {
    text-indent: 0;
  }

  .footnotes hr {
    margin-top: 4em;
    margin-bottom: 0.5em;
  }

  // inline代码
  code {
    display: inline;
    color: @code-font-color;
  }

  // 代码块
  .code-section {
    display: flex;
    border: solid 1px @border-color;
    margin: @block-mg-v 0;
    line-height: @code-line-height;
    padding: @code-section-padding;
    font-family: @code-font-family;

    pre {
      margin: 0;
      margin-block-start: 0;
      margin-block-end: 0;
      white-space: normal;
      overflow-x: auto;
      padding: 0 0 0 @code-section-pre-padding-left;
    }

    code {
      display: flex;
      text-wrap: nowrap;
      font-family: @code-font-family;
    }

    ul {
      margin: 0;
      padding: 0;
      margin-block-start: 0;
      margin-block-end: 0;
      width: fit-content;
      flex-shrink: 0;
      height: 100%;
      line-height: @code-line-height;
      list-style-type: none;

      > li {
        text-align: right;
      }
    }
  }
}
```