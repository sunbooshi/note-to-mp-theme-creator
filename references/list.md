## 设置列表的编号、标记颜色
```` less
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
````

