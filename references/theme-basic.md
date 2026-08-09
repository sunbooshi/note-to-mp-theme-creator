## 设置标题、加粗、分割线颜色

通过设置主色来调整标题、加粗、分割线的颜色

````CSS
```less
@primary-color: #33357D; 
.note-to-mp {
	h1, h2, h3, h4, h5, h6 {
	    color: @primary-color;
	}
	strong, em {
	    color: @primary-color;
	}
	.note-to-mp hr {
	    border-top: 1px solid @primary-color;
	}
}
```
````