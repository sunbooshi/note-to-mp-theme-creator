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