## 设置列表的编号、标记颜色
由于 `::marker` 是伪元素，无法作为嵌入样式使用。所以定义编号、标记颜色必须分为两部分：
1. 设置 `ul > li` 颜色与标记颜色一致；
2. 使用 `ul > li > section` 确保文字颜色没有改变；

示例代码中的 `ul > li::marker` 是为了保证在Obsidian中正常显示颜色。

``` less
@list-mark-color: #3370ff; // 编号、标记颜色
@list-text-color: #1f2329; // 列表文字颜色
.note-to-mp {
	ul > li {
	  color: @list-mark-color;
	}
	ul > li::marker {
	  color: @list-mark-color;
	}
	ul > li > section {
	  color: @list-text-color;
	}
}
```
