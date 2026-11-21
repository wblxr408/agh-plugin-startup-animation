# AGH 开场动画 · AGH Startup Animation

这个市场版本提供 AGH 配置 Bundle。AGH 开场动画的实际运行功能由独立组件 `@wblxr408/startup-animation-runtime` 提供。

## 安装

1. 安装经固定提交发布的运行组件。在 AGH 中审核其权限，再信任和启用。

   ```sh
   agh plugins add git:https://github.com/wblxr408/agh-plugin-startup-animation#4932fa988f41c4390e979f9a0b6064e86aac00af
   ```

2. 在 AGH 市场安装并启用 `@wblxr408/startup-animation` 0.4.0。刷新 AGH Web 工作台即可观看或跳过开场动画。

市场包的智能体入口提供只读配置说明。实际界面由运行组件注册。

如果已安装本仓库的旧版插件，请先用市场 Bundle 更新旧版，再安装新的运行组件，避免同一功能同时加载两个版本。

[运行组件文档](https://github.com/wblxr408/agh-plugin-startup-animation/tree/runtime-v0.3.0) · [AGH 插件安装指南](https://github.com/AgnesAI-Labs/agnes-harness/blob/main/docs/guide/packages.zh-CN.md)
