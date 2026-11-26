import { createElement, useEffect, useRef, useSyncExternalStore } from 'react'
import { mountIntro } from './intro.js'

const SLOT = 'shell.overlay'
const PLAYED = Symbol.for('agnes.startup-animation.played')
const PACKAGE = '@wblxr408/startup-animation-runtime'
const GUIDE = 'startup-animation-guide'
const GUIDE_TITLE = 'startup-animation.guide'
const guideCopy = {
  en: {
    title: 'Startup animation',
    playback: 'Opening or reloading the workbench automatically plays the original intro once, for about 5 seconds. Choose Skip intro or press Escape to enter sooner. Reduced motion shows a brief static logo.',
    recovery: 'To stop the intro from playing in future, go to Settings → Application and choose Restore official interface.',
  },
  'zh-CN': {
    title: '开场动画',
    playback: '打开或刷新工作台时，原版开场动画会自动播放一次，约 5 秒。选择「跳过开场」或按 Esc 可提前进入。开启减少动态效果时只会短暂显示静态标志。',
    recovery: '若不再需要开场动画，请前往「设置 → 应用」并选择「恢复官方界面」。',
  },
}

function StartupOverlay() {
  const host = useRef(null)
  useEffect(() => {
    const element = host.current
    const document = element.ownerDocument
    const window = document.defaultView
    if (!window || document[PLAYED]) return

    let dispose
    // Defer until the shell has committed. Disposing a staged mount cancels playback.
    const frame = window.requestAnimationFrame(() => {
      if (document[PLAYED]) return
      dispose = mountIntro(element)
      if (dispose) document[PLAYED] = true
    })
    return () => {
      window.cancelAnimationFrame(frame)
      dispose?.()
    }
  }, [])
  return createElement('div', { ref: host })
}

export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(PACKAGE, {
    en: { [GUIDE_TITLE]: guideCopy.en.title },
    'zh-CN': { [GUIDE_TITLE]: guideCopy['zh-CN'].title },
  }))
  ctx.homeEntries.register({
    id: GUIDE,
    placement: 'secondary',
    titleKey: GUIDE_TITLE,
    icon: 'play',
    order: 50,
    component() {
      const language = useSyncExternalStore(ctx.locale.subscribe, ctx.locale.getSnapshot)
      const copy = guideCopy[language] ?? guideCopy.en
      return createElement('article', null,
        createElement('h1', null, copy.title),
        createElement('p', null, copy.playback),
        createElement('p', null, copy.recovery),
      )
    },
  })
  return ctx.slots.inject(SLOT, () =>
    ctx.slots.register({ name: SLOT, id: 'startup-animation' }, StartupOverlay),
  )
}
