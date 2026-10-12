``` less
.note-to-mp {
  // 行间公式
  .block-math-svg {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin:20px 0px;
    max-width: 300% !important;
  }

  // 行间公式
  .block-math-svg svg {
    scale: 1;
  }

  // 行间公式
  .block-math-section {
    text-align: center;
    overflow: auto;
  }

  // 行内公式
  .inline-math-svg svg {
    font-size: 1em;
    overflow: visible;
  }
}
```