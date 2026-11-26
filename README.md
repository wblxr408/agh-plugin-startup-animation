# Agnes 开场动画 · Agnes startup animation

在 Agnes Harness 的 Web 工作台加载时播放约 5.1 秒的开场。暗场中的 Agnes 标志由终端字符逐格成像。底纹与光线过渡到白纸色技术档案，同一个标志进入扫描光环，几道错峰展开的线条引出 Agnes Harness 字标，再淡入工作台。

## 安装与启用

需要支持通过**设置 → 应用**审阅并采用第三方应用的 Agnes Harness Web 工作台（如 [`develop` 的 `4f548b12`](https://github.com/AgnesAI-Labs/agnes-harness/commit/4f548b121eccd9ed62f2ee4625d79a7a73163e8a)）。宿主须提供插件 API `^5.0.0` 和 React `18.3.1`；Node.js 须为 `24.10` 或更新版本。

从本运行组件的检出目录安装 `0.3.1`：

```sh
agh plugins add file:/path/to/agh-plugin-startup-animation
```

1. 在安装预览中确认来源和 `ui` 权限。安装、信任和启用插件不会在浏览器中播放动画。
2. 打开 **设置 → 应用**，预览开场动画应用。审阅页的「显示的导航」说明：采用后，工作台在打开或刷新时会自动显示约 5 秒的全屏开场。选择 **采用** 会切换当前配置的应用。
3. 用「跳过开场」或 Esc 提前关闭。系统开启「减少动态效果」或 Canvas 不可用时，只短暂显示静态字标。工作台内切换页面不会重播。

若要撤销开场，选择 **设置 → 应用 → 恢复官方界面**。也可打开 `/?admin` 进行恢复。不建议同时启用其他开场插件。

The separately installed runtime still requires Agnes Harness. Install and trust it, then review and adopt it in **Settings → Application**. Adoption does not replace the official conversation or navigation interfaces. The approved profile client provides the guide and the `shell.overlay` animation. The original silent Canvas intro plays once when a workbench document opens or reloads. It does not replay during in-app navigation. Choose **Skip intro** or press Escape to dismiss it. Reduced motion shows a brief static logo. Choose **Restore official interface** to revoke the application.

- Pi. The per-character title reveal and terminal framing follow [Beautiful Pi](https://github.com/danielmrdev/beautiful-pi#animated-startup-banner). The moving underline follows [pi-ui's loading sweep](https://pi.dev/packages/@rokiy/pi-ui).
- Hermes. The exposure bridge, pale dossier, corner marks, and grid follow the [Hermes Boot Screen](https://hermes-agent.nousresearch.com/marketplace/hermes-boot-screen) sequence, itself adapted from [dsh-startup-screen](https://github.com/6shenhonghong9/dsh-startup-screen).
- DSH. The vertical scanning light, staggered orbital pulses and bars follow [dsh-startup-animation](https://github.com/davidLi17/dsh-startup-animation#dsh-startup-animation).
