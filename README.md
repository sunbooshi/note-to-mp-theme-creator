# NoteToMP插件主题创建Skill

> [!tip]
> 1.1.0 版本新增主题预览

## 安装
通过如下地址安装：

```
https://github.com/sunbooshi/note-to-mp-theme-creator
```

## 使用

支持:
- Codex
- Claude Code
- WorkBuddy


通过 `/` 指令调用Skill


## 示例
### 自定义标题样式
**提示词**：

```
帮我定义一个二级标题样式，标题左侧添加竖线，整体有一个浅色背景，颜色有科技感
```

**输出**：

```less
.note-to-mp {
  h2 {
    border-left: 4px solid #0e7cff;
    background-color: rgba(14, 124, 255, 0.08);
    color: #0754c2;
    font-size: 1.25em;
    font-weight: bold;
    line-height: 1.5em;
    padding: 0.6em 0.8em;
    border-radius: 0 8px 8px 0;
    margin: 1.6em 0 1em;
  }
}
```

**效果**：

<img width="470" height="99" alt="Image" src="https://github.com/user-attachments/assets/291a0e98-0afe-4026-a187-193869907194" />



### 自定义复杂标题样式
**提示词**：
```
我需要一个新的标题样式，它分为两行，居中展示，第一行是加大的数字，第二行是详细的标题。例如：“02NoteToMP是专为微信公众号创作者打造的Obsidian插件”，其中“02”在第一行，“NoteToMP是专为微信公众号创作者打造的Obsidian插件在第二行”。
```

**输出**：
```less
.note-to-mp {
  h2 {
    text-align: center;
    margin: 2em 0 1.5em;
    color: #0f172a;

    strong {
      display: block;
      font-size: 2em;
      font-weight: bold;
      color: #0e7cff;
      line-height: 1.3em;
      letter-spacing: 0.1em;
    }
  }
}
```

**效果**：
<img width="442" height="126" alt="Image" src="https://github.com/user-attachments/assets/f1f7f9e6-594a-4d2c-8d3a-ae53f1a09804" />

## 图片
**提示词**：
```
我需要一个图片样式，图片居中，增加一个12px的圆角，增加阴影。
```

**输出**：
```less
.note-to-mp {
  img {
    max-width: 100% !important;
    height: auto;
    display: block;
    margin: 1em auto;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  }
}
```


### 完整样式
**提示词**：
```
参考这篇 https://mp.weixin.qq.com/s/fHUEv_F0kOpmCgpNL6h7ag 文章的样式，帮我生成主题。
```
