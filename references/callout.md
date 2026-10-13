# Callout

**Callout样式是内部样式，仅在用户明确需要修改的情况下加入到自定义样式中。**

``` less
.note-to-mp {
  // callout容器
  .note-callout {
    border: none;
    padding: 1em 1em 1em 1.5em;
    display: flex;
    flex-direction: column;
    margin: 1em 0;
    border-radius: 4px;
  }

  // callout标题容器
  .note-callout-title-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 1em;
    font-weight: 600;
  }

  // callout icon
  .note-callout-icon {
    display: inline-block;
    width: 18px;
    height: 18px;  
  }

  .note-callout-icon svg {
    width: 100%;
    height: 100%;
  }

  // callout标题
  .note-callout-title {
    margin-left: 0.25em;
  }

  // callout内容容器
  .note-callout-content {
    color: rgb(34,34,34);
  }

  /* note info todo */
  .note-callout-note { 
    color: rgb(8, 109, 221);
    background-color: rgba(8, 109, 221, 0.1);
  }
  /* abstract tip hint */
  .note-callout-abstract {
    color: rgb(0, 191, 188);
    background-color: rgba(0, 191, 188, 0.1);
  }
  .note-callout-success {
    color: rgb(8, 185, 78);
    background-color: rgba(8, 185, 78, 0.1);
  }
  /* question  help, faq, warning, caution, attention */
  .note-callout-question {
    color: rgb(236, 117, 0);
    background-color: rgba(236, 117, 0, 0.1);
  }
  /* failure, fail, missing, danger, error, bug */
  .note-callout-failure {
    color: rgb(233, 49, 71);
    background-color: rgba(233, 49, 71, 0.1);
  }
  .note-callout-example {
    color: rgb(120, 82, 238);
    background-color: rgba(120, 82, 238, 0.1);
  }
  .note-callout-quote {
    color: rgb(158, 158, 158);
    background-color: rgba(158, 158, 158, 0.1);
  }
  /* custom icon callout */
  .note-callout-custom { 
    color: rgb(8, 109, 221);
    background-color: rgba(8, 109, 221, 0.1);
  }
}
```