# ASCII 交互原理演示

- [中文版](context-explainer.zh-CN.html)
- [English](context-explainer.html)

两个已提交的 HTML 均可独立运行：下载后直接用浏览器打开，或在 `website/`
下运行 `python3 -m http.server 8090`。查看时不需要安装依赖、构建、外部脚本、
字体、网络请求或模型调用。

第一个动画把摘要树中的活跃节点投影为下一轮模型输入：原文收缩为摘要、
四个摘要合并成父块，解压后增加工具结果或文件回执。第二个动画展示派发过程中
彼此独立的主、子 Pi 会话上下文。

输入顺序、大小和调度节奏均经过教学简化。示例使用 50K 原文批次、1K 摘要、
每四块晋升与 2K 固定输入。真实模型决策和保护范围会不同；这不是性能测试结果。
`.out`、`demo.txt` 和会话名称都是示例，页面不会创建这些文件。

## 修改与生成

`src/` 中两个片段的交互逻辑由中英版本共用。`src/en.json` 负责静态文字和
动态生成标签的英文翻译。修改后运行：

```bash
node website/interactive/build.mjs
```

生成器把 CSS 和脚本内联进两个页面；若英文片段有未翻译的中文，或页面依赖
宿主接口、外部网络资源，会直接报错。`src/standalone.css` 提供独立页面的控件
样式和深浅主题。浏览器不允许本地存储时，动画仍可运行。

另见 [English maintenance notes](README.md)。
