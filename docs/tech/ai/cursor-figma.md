---
title: Cursor：基于Figma设计稿开发
toc: content
group:
  title: Cursor
  order: 1
order: 1
---

# Cursor：基于Figma设计稿开发

## 基于figma-developer-mcp的MCP服务
### 生成figma token
登录figma后，点击头像，在下拉菜单里选择settings，切换到SecurityTab，并点击Generate new token
![](https://qiniu.zengcreates.cn/ai_coding/1/figma_sec.png)
设置名称、过期日期及相应的权限范围：
![](https://qiniu.zengcreates.cn/ai_coding/1/figma-mcp-scope.png)
复制生成的token,这个token,只显示一次。
### 配置cursor的MCP服务
打开cursor的配置：
![图片](https://qiniu.zengcreates.cn/ai_coding/1/figma_mcp_setting.png)
点击Tools & MCP及Add Custom MCP
![图片](https://qiniu.zengcreates.cn/ai_coding/1/figma0.png)
```json
{
  "mcpServers": {
    "Framelink Figma MCP": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp",
        "--figma-api-key=your_figma_token",
        "--stdio"
      ]
    }
  }
}
```
将配置里的your_figma_token替换为上一个步骤生成的token。
![](https://qiniu.zengcreates.cn/ai_coding/1/figma1.png)
现在绿点，表示配置成功。
### 使用Figma的设计稿
选择相应的设计稿，并点击share:
![](https://qiniu.zengcreates.cn/ai_coding/1/figma2.png)
复制相应的链接：
![](https://qiniu.zengcreates.cn/ai_coding/1/figma3.png)
在cursor命令行里，输入
```txt
@Figma [url] 请根据这个设计稿生成一个 React + Tailwind 的 Header 组件。
```
@Figma 并不是必须的指令，cursor会根据此找到figma的mcp，也可以直接输入mcp的名称来指定使用相应的MCP解析url，如：
```
使用 Framelink Figma MCP 读取 [url] ，并实现下该页面。
```

## 总结
与传统的开发模式对比：
- 开发效率更高
- 还原更准确
- 更新更方便

生成后的代码，还是需要看下的，特别是逻辑部分。

还原的效果通常也会有出入，当然这也和设计稿是否规范有关，比如是否使用Auto Layout布局。

