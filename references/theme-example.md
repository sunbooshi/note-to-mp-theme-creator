## 示例LESS
### 标题
``` less
.note-to-mp {
  h1, h2, h3, h4, h5, h6 {
    color: #222222;
    font-weight: bold;
    font-size: 2em;
    margin-top: 2em;
    margin-bottom: 1em;
    border-left: 0.2em solid #222222;
    padding-left: 0.5em;
  }
}
```

### 段落
``` less
.note-to-mp {
  p {
    margin: 2em 0;
    line-height: 1.6em;
  }
}
```

### 列表
``` less
.note-to-mp {
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
}
```

### 分割线
``` less
.note-to-mp {
  hr {
    height: 1px;
    border: 0;
    background-color: @border-color;
    border-style: @hr-bd-style;
    border-width: @hr-bd-width;
  }
}
```

### 引用
``` less
.note-to-mp {
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
}
``` 

### 代码块
``` less
.note-to-mp {
  .code-section {
    display: flex;
    border: solid 1px @border-color;
    margin: 1.5em 0;
    line-height: 26px;
    padding: 0.5em;
    font-family: @code-font-family;

    pre {
      margin: 0;
      margin-block-start: 0;
      margin-block-end: 0;
      white-space: normal;
      overflow-x: auto;
      padding: 0 0 0 1em;
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
      line-height: 26px;
      list-style-type: none;

      > li {
        text-align: right;
      }
    }
  }
}
```

### 图片
``` less
.note-to-mp {
  img {
    max-width: 100%;
    height: auto;
  }
}
```

### 图片标题
``` less
.note-to-mp {
  figcaption {
    text-align: center;
  }
}
```

### 强调
``` less
.note-to-mp {
  b, strong {
    font-weight: @bold-font-weight;
  }

  i, em {
    font-style: @italic-font-style;
  }
}
```

### 删除
``` less
.note-to-mp {
  del, s {
    color: @del-font-color;
  }
}
```

### 表格
``` less
.note-to-mp {
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
}
```

### 标注
``` less
.note-to-mp {
  section .note-callout {
    border: none;
    padding: 1em 1em 1em 1.5em;
    display: flex;
    flex-direction: column;
    margin: 1em 0;
    border-radius: 4px;
  }

  section .note-callout-title-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 1em;
    font-weight: 600;
  }

  .note-callout-icon {
    display: inline-block;
    width: 18px;
    height: 18px;  
  }

  .note-callout-icon svg {
    width: 100%;
    height: 100%;
  }

  section .note-callout-title {
    margin-left: 0.25em;
  }

  section .note-callout-content {
    color: rgb(34,34,34);
  }

  /* note info todo */
  section .note-callout-note { 
    color: rgb(8, 109, 221);
    background-color: rgba(8, 109, 221, 0.1);
  }
  /* abstract tip hint */
  section .note-callout-abstract {
    color: rgb(0, 191, 188);
    background-color: rgba(0, 191, 188, 0.1);
  }
  section .note-callout-success {
    color: rgb(8, 185, 78);
    background-color: rgba(8, 185, 78, 0.1);
  }
  /* question  help, faq, warning, caution, attention */
  section .note-callout-question {
    color: rgb(236, 117, 0);
    background-color: rgba(236, 117, 0, 0.1);
  }
  /* failure, fail, missing, danger, error, bug */
  section .note-callout-failure {
    color: rgb(233, 49, 71);
    background-color: rgba(233, 49, 71, 0.1);
  }
  section .note-callout-example {
    color: rgb(120, 82, 238);
    background-color: rgba(120, 82, 238, 0.1);
  }
  section .note-callout-quote {
    color: rgb(158, 158, 158);
    background-color: rgba(158, 158, 158, 0.1);
  }
  /* custom icon callout */
  section .note-callout-custom { 
    color: rgb(8, 109, 221);
    background-color: rgba(8, 109, 221, 0.1);
  }
}
```
### 数学公式
``` less
.note-to-mp {
  .block-math-svg {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin:20px 0px;
    max-width: 300% !important;
  }

  .block-math-svg svg {
    scale: 0.85;
  }

  .block-math-section {
    text-align: center;
    overflow: auto;
  }

  .inline-math-svg svg {
    font-size: 0.85em;
  }
}
```

### 空行
``` less
.note-to-mp {
  p.note-empty-line {
    line-height: 1.2em;
    margin-top: -0.75em;
    margin-bottom: -0.45em;
  }
}
```