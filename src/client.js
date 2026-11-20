import { createElement, useEffect, useRef } from 'react'
import { mountIntro } from './intro.js'

const SLOT = 'shell.overlay'
const PLAYED = Symbol.for('agnes.startup-animation.played')

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
  return ctx.slots.inject(SLOT, () =>
    ctx.slots.register({ name: SLOT, id: 'startup-animation' }, StartupOverlay),
  )
}
