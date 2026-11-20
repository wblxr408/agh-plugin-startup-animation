import { startArtwork } from './artwork.js'
import { BRAND_MS, FADE_MS, PLAYBACK_MS } from './motion.js'

const STATIC_MS = 720

export function mountIntro(host) {
  const document = host.ownerDocument
  const window = document.defaultView
  if (!window || document.hidden || document.querySelector('dialog:modal')) return undefined

  const chinese = document.documentElement.lang.toLowerCase().startsWith('zh')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const dialog = document.createElement('dialog')
  dialog.className = 'agh-startup-intro'
  dialog.setAttribute('aria-label', chinese ? 'Agnes Harness 开场动画' : 'Agnes Harness startup animation')
  dialog.style.setProperty('--intro-brand-delay', `${BRAND_MS}ms`)
  dialog.style.setProperty('--intro-duration', `${PLAYBACK_MS}ms`)
  dialog.style.setProperty('--intro-fade', `${FADE_MS}ms`)

  const scene = document.createElement('div')
  scene.className = 'agh-startup-scene'
  scene.setAttribute('aria-hidden', 'true')

  const lockup = document.createElement('div')
  lockup.className = 'agh-startup-lockup'
  const mark = document.createElement('div')
  mark.className = 'agh-startup-mark'
  mark.setAttribute('aria-hidden', 'true')
  const title = document.createElement('p')
  title.className = 'agh-startup-wordmark'
  const name = document.createElement('span')
  name.className = 'agh-startup-name'
  name.textContent = 'Agnes'
  const suffix = document.createElement('span')
  suffix.className = 'agh-startup-suffix'
  suffix.textContent = 'Harness'
  title.append(name, ' ', suffix)
  const lines = document.createElement('div')
  lines.className = 'agh-startup-lines'
  lines.setAttribute('aria-hidden', 'true')
  for (let i = 0; i < 3; i++) lines.append(document.createElement('i'))
  lockup.append(mark, title, lines)

  const rail = document.createElement('div')
  rail.className = 'agh-startup-rail'
  rail.setAttribute('aria-hidden', 'true')

  const skip = document.createElement('button')
  skip.className = 'agh-startup-skip'
  skip.type = 'button'
  skip.autofocus = true
  skip.textContent = chinese ? '跳过开场' : 'Skip intro'

  dialog.append(scene, lockup, rail, skip)
  host.append(dialog)

  let timer
  let stopArtwork
  let closing = false
  let disposed = false

  function dispose() {
    if (disposed) return
    disposed = true
    window.clearTimeout(timer)
    stopArtwork?.()
    reducedMotion.removeEventListener('change', onMotionChange)
    if (dialog.open) dialog.close()
    dialog.remove()
  }

  function close() {
    if (closing || disposed) return
    closing = true
    window.clearTimeout(timer)
    if (dialog.dataset.static === 'true') {
      dispose()
      return
    }
    dialog.classList.add('agh-startup-exiting')
    timer = window.setTimeout(dispose, FADE_MS)
  }

  function showStatic() {
    if (closing || disposed) {
      dispose()
      return
    }
    stopArtwork?.()
    stopArtwork = undefined
    scene.replaceChildren()
    dialog.dataset.static = 'true'
    window.clearTimeout(timer)
    timer = window.setTimeout(dispose, STATIC_MS)
  }

  function onMotionChange(event) {
    if (event.matches) showStatic()
  }

  skip.addEventListener('click', close)
  // Handle Escape from the focused overlay even when the browser emits no native cancel event.
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.isComposing) return
    event.preventDefault()
    event.stopPropagation()
    close()
  })
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    close()
  })
  dialog.addEventListener('close', dispose, { once: true })

  try {
    dialog.showModal()
    reducedMotion.addEventListener('change', onMotionChange)
    if (reducedMotion.matches) {
      showStatic()
    } else {
      const canvas = document.createElement('canvas')
      scene.append(canvas)
      try {
        stopArtwork = startArtwork(canvas, showStatic)
      } catch {
        showStatic()
        return dispose
      }
      if (stopArtwork) timer = window.setTimeout(close, PLAYBACK_MS)
      else showStatic()
    }
  } catch {
    dispose()
  }
  return disposed ? undefined : dispose
}
