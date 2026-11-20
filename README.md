# Agnes 开场动画 · Agnes startup animation

在 Agnes Harness 的 Web 工作台加载时播放约 5.1 秒的开场。暗场中的 Agnes 标志由终端字符逐格成像。底纹与光线过渡到白纸色技术档案，同一个标志进入扫描光环，几道错峰展开的线条引出 Agnes Harness 字标，再淡入工作台。

安装已构建的 Agnes Harness 后，运行：

```powershell
agh plugins add git:https://github.com/wblxr408/agh-plugin-startup-animation#v0.3.0
```

在安装预览中确认来源和 UI 权限，然后打开或刷新 Web 工作台。可用 Esc 或右下角的「跳过开场」提前进入工作台。系统开启「减少动态效果」或 Canvas 不可用时，会短暂显示静态字标。在插件页禁用开场动画可关闭自动播放。

The profile-lifetime browser module registers through `shell.overlay` and plays once per document. Canvas draws the terminal glyphs, exposure transition and optical scale. CSS reveals the type and hands the screen back to the workbench. Playback is silent, with the light and dark Agnes palettes used by scene.

- Pi. The per-character title reveal and terminal framing follow [Beautiful Pi](https://github.com/danielmrdev/beautiful-pi#animated-startup-banner). The moving underline follows [pi-ui's loading sweep](https://pi.dev/packages/@rokiy/pi-ui).
- Hermes. The exposure bridge, pale dossier, corner marks, and grid follow the [Hermes Boot Screen](https://hermes-agent.nousresearch.com/marketplace/hermes-boot-screen) sequence, itself adapted from [dsh-startup-screen](https://github.com/6shenhonghong9/dsh-startup-screen).
- DSH. The vertical scanning light, staggered orbital pulses and bars follow [dsh-startup-animation](https://github.com/davidLi17/dsh-startup-animation#dsh-startup-animation).
