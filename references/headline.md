通过 `h2 strong`  来专门设置标题中粗体的样式，形成独特的标题样式。

```less
.note-to-mp {
    font-family: Optima-regular, Optima, "Microsoft YaHei", PingFangSC-regular, serif;

	h2 strong {
	    display: inline-block;
	    background: rgb(90, 185, 131);
	    color: rgb(255, 255, 255);
	    padding: 2px 16px;
	    border-top-right-radius: 3px;
	    border-top-left-radius: 3px;
	    margin-right: 10px;
	    visibility: visible;
	}
	
	h2 {
	  border-bottom: rgb(90, 185, 131) 2px solid;
	  color: rgb(90, 185, 131);
	}
	
	section .note-callout-example {
	    color: rgb(90, 185, 131);
	    background-color: rgba(90, 185, 131, 0.1);
	}
}
```