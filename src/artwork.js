import { ink, mix, noise, smooth, TAU } from './motion.js'

const GRID = 40
const glyphs = '.:+*#'
// The contour of the workbench's brand-mark.png, in its original 64 × 64 coordinates.
const markOutline = [
  'M44.46 10.14C44.46 7.66 46.47 5.65 48.95 5.65S53.44 7.66 53.44 10.14 51.43 14.63 48.95 14.63 44.46 12.62 44.46 10.14Z',
  'M46.63 20.12C48.91 18.42 52.39 18.54 51.97 21.54C51.29 27.6 50.41 33.25 49.73 37.04',
  'C48.54 42.41 51.03 42.64 55.86 40.79C56.35 43.24 52.33 44.47 50.42 46.14',
  'C47.42 48.45 49.99 50.62 49.12 52.96C48.32 55.36 45.59 54.85 44.82 52.64',
  'C44.17 48.43 44.13 47.12 41.51 43.97C39.17 41.19 41.37 41.93 43.83 41.24',
  'C46.23 40.55 45.91 36.65 47.98 28.3C49.26 23.13 46.62 27.29 45.8 28.99',
  'C39.59 41.89 29.1 53.35 18.03 56.06C13.73 57.31 9.74 56.87 7.68 53.48',
  'C5.5 50.29 6.19 45.78 7.93 42.33C9.86 45.31 13.61 48.39 17.92 47.05',
  'C27.67 44.18 36.74 34.67 40.51 27.68C42.67 24.24 44.57 21.39 46.63 20.12Z',
].join('')

function makeMark(document, window) {
  const outline = new window.Path2D(markOutline)
  const mask = document.createElement('canvas')
  mask.width = mask.height = 128
  const drawing = mask.getContext('2d')
  drawing.scale(2, 2)
  drawing.fill(outline)
  const { data } = drawing.getImageData(0, 0, 128, 128)
  const cells = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const x = Math.floor(((col + 0.5) * 128) / GRID)
      const y = Math.floor(((row + 0.5) * 128) / GRID)
      const alpha = data[(y * 128 + x) * 4 + 3] / 255
      if (alpha < 0.22) continue
      const seed = noise(row * GRID + col)
      cells.push({ col, row, alpha, seed, glyph: glyphs[Math.min(4, Math.floor(alpha * 3.8 + seed * 0.8))] })
    }
  }
  return { outline, cells }
}

function setup(canvas, ctx, window) {
  const width = Math.max(1, canvas.clientWidth)
  const height = Math.max(1, canvas.clientHeight)
  const scale = Math.min(window.devicePixelRatio || 1, 2, 2350 / Math.max(width, height))
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0)
  const compact = width < 680
  const marginX = Math.min(88, width * (compact ? 0.075 : 0.07))
  const marginY = Math.min(90, height * 0.105)
  const radius = Math.min(width * (compact ? 0.335 : 0.198), height * (compact ? 0.207 : 0.325), 250)
  const night = ctx.createRadialGradient(
    width / 2,
    height * 0.46,
    0,
    width / 2,
    height * 0.46,
    Math.max(width, height) * 0.62,
  )
  night.addColorStop(0, ink.haze)
  night.addColorStop(0.4, ink.night)
  night.addColorStop(1, ink.background)
  const paper = ctx.createLinearGradient(width, 0, 0, height)
  paper.addColorStop(0, ink.tint)
  paper.addColorStop(0.36, ink.white)
  paper.addColorStop(1, ink.paper)
  const frame = { width, height, compact, marginX, marginY, radius, night, paper }
  return {
    ...frame,
    darkDots: dotField(window.Path2D, frame, false),
    lightDots: dotField(window.Path2D, frame, true),
  }
}

function line(ctx, x, y, endX, endY) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(endX, endY)
  ctx.stroke()
}

function corners(ctx, frame, light) {
  const { width, height, marginX: x, marginY: y } = frame
  ctx.strokeStyle = light ? ink.blue : ink.highlight
  ctx.globalAlpha = light ? 0.18 : 0.22
  ctx.lineWidth = 0.7
  ctx.strokeRect(x, y, width - x * 2, height - y * 2)
  ctx.globalAlpha *= 0.62
  line(ctx, x, y + 14, width - x, y + 14)
  line(ctx, x, height - y - 14, width - x, height - y - 14)
  ctx.globalAlpha = light ? 0.64 : 0.45
  ctx.lineWidth = 1
  for (const [cx, cy, dx, dy] of [
    [x, y, 1, 1],
    [width - x, y, -1, 1],
    [x, height - y, 1, -1],
    [width - x, height - y, -1, -1],
  ]) {
    line(ctx, cx, cy, cx + dx * 19, cy)
    line(ctx, cx, cy, cx, cy + dy * 19)
  }
  ctx.globalAlpha *= 0.75
  line(ctx, x + 13, y + 7, x + 48, y + 7)
  line(ctx, width - x - 48, height - y - 7, width - x - 13, height - y - 7)
}

function dotField(Path, frame, light) {
  const { width, height, marginX: x, marginY: y } = frame
  const pitch = frame.compact ? 10 : 13
  const startX = light && !frame.compact ? width * 0.49 : x + 24
  const dots = new Path()
  for (let iy = y + 30; iy < height - y - 22; iy += pitch) {
    for (let ix = startX; ix < width - x - 16; ix += pitch) dots.rect(ix, iy, 0.85, 0.85)
  }
  return dots
}

function terminal(ctx, frame, x, y, span, mark, t) {
  const presence = 1 - smooth(1.72, 2.49, t)
  if (presence < 0.01) return
  const pitch = span / GRID
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${pitch * 1.12}px Consolas, monospace`
  for (const cell of mark.cells) {
    const settle = smooth(
      0.09 + cell.col * 0.019 + cell.seed * 0.3,
      0.29 + cell.col * 0.019 + cell.seed * 0.3,
      t,
    )
    if (settle <= 0) continue
    const px = x - span / 2 + (cell.col + 0.5) * pitch
    const py = y - span / 2 + (cell.row + 0.5) * pitch + (1 - settle) * pitch * (cell.seed - 0.5) * 7
    ctx.globalAlpha = settle * presence * Math.max(0.32, cell.alpha)
    ctx.fillStyle = cell.seed > 0.7 ? ink.text : cell.seed > 0.26 ? ink.highlight : ink.mark
    ctx.fillText(cell.glyph, px, py)
  }
  const ruler = Math.min(span * 0.9, frame.width * 0.44)
  const baseline = y + span * 0.55
  const leader = smooth(0.06, 1.43, t)
  const edge = x - ruler / 2 + ruler * leader
  ctx.strokeStyle = ink.mark
  ctx.lineWidth = 1
  ctx.globalAlpha = presence * 0.34
  line(ctx, x - ruler / 2, baseline, x + ruler / 2, baseline)
  ctx.globalAlpha = presence * 0.88
  ctx.strokeStyle = ink.highlight
  line(ctx, x - ruler / 2, baseline, edge, baseline)
  ctx.fillStyle = ink.text
  ctx.fillRect(edge - 2, baseline - 1, 4, 2)
}

function arc(ctx, x, y, radius, start, span) {
  ctx.beginPath()
  ctx.arc(x, y, radius, start, start + span)
  ctx.stroke()
}

function insignia(ctx, frame, x, y, mark, t) {
  const strength = smooth(1.58, 2.72, t)
  if (strength < 0.01) return
  const r = frame.radius
  const settled = smooth(2.07, 3.79, t)
  const radius = r * mix(0.81, 1, settled)
  const lens = ctx.createRadialGradient(x - r * 0.27, y - r * 0.29, 0, x, y, r * 0.85)
  lens.addColorStop(0, ink.white)
  lens.addColorStop(0.6, ink.tint)
  lens.addColorStop(1, ink.paper)
  ctx.globalAlpha = strength * 0.93
  ctx.fillStyle = lens
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.69, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = ink.blue
  ctx.lineWidth = 0.8
  ctx.globalAlpha = strength * 0.31
  for (const ratio of [0.67, 0.69, 0.86, 0.94, 1.07]) arc(ctx, x, y, radius * ratio, 0, TAU)
  ctx.globalAlpha = strength * 0.5
  for (let i = 0; i < 72; i++) {
    const a = (i * TAU) / 72
    const tick = i % 6 === 0 ? 0.077 : 0.032
    const dx = Math.cos(a) * radius
    const dy = Math.sin(a) * radius
    line(ctx, x + dx * (1 - tick), y + dy * (1 - tick), x + dx, y + dy)
  }
  const spin = mix(-1.87, -0.68, settled)
  ctx.lineWidth = 1.5
  ctx.globalAlpha = strength * 0.94
  arc(ctx, x, y, radius * 0.86, spin, 1.52)
  arc(ctx, x, y, radius * 0.86, spin + Math.PI, 0.84)
  ctx.globalAlpha *= 0.68
  arc(ctx, x, y, radius * 1.07, -spin - 0.9, 0.58)
  arc(ctx, x, y, radius * 1.07, -spin + 2.39, 0.82)

  for (let i = 0; i < 3; i++) {
    const p = smooth(2.13 + i * 0.17, 3.41 + i * 0.17, t)
    if (p <= 0 || p >= 1) continue
    ctx.strokeStyle = ink.focus
    ctx.lineWidth = 0.9
    ctx.globalAlpha = (1 - p) ** 1.7 * strength * 0.72
    arc(ctx, x, y, radius * mix(0.72, 1.39, p), -0.4 + i * 0.56, TAU - 1.22)
  }
  ctx.globalAlpha = smooth(2.13, 3.09, t)
  const size = Math.min(245, radius * 1.21)
  ctx.save()
  ctx.translate(x - size / 2, y - size / 2)
  ctx.scale(size / 64, size / 64)
  const color = ctx.createLinearGradient(10, 50, 54, 11)
  color.addColorStop(0, ink.blue)
  color.addColorStop(0.69, ink.focus)
  color.addColorStop(1, ink.mark)
  ctx.fillStyle = color
  ctx.fill(mark.outline)
  ctx.restore()
  ctx.globalAlpha *= 0.54
  ctx.fillStyle = ink.blue
  for (const side of [-1, 1]) {
    ctx.fillRect(x + radius * 1.07 * side - 2, y - 2, 4, 4)
    ctx.fillRect(x - 2, y + radius * 1.07 * side - 2, 4, 4)
  }
}

function pass(ctx, frame, t, from, to, light) {
  const phase = smooth(from, to, t)
  if (phase <= 0 || phase >= 1) return
  const { width, height, marginX, marginY } = frame
  const shine = Math.sin(Math.PI * phase)
  const x = mix(marginX * 0.47, width - marginX * 0.47, phase)
  const spread = width * (light ? 0.055 : 0.145)
  const gradient = ctx.createLinearGradient(x - spread, 0, x + spread, 0)
  gradient.addColorStop(0, '#6983fc00')
  gradient.addColorStop(0.43, light ? '#4f5bd547' : '#a5acff48')
  gradient.addColorStop(0.5, light ? ink.white : ink.highlight)
  gradient.addColorStop(0.54, light ? '#4f5bd530' : '#6983fc51')
  gradient.addColorStop(1, '#6983fc00')
  ctx.globalAlpha = shine * (light ? 0.56 : 0.76)
  ctx.fillStyle = gradient
  ctx.fillRect(x - spread, marginY * 0.58, spread * 2, height - marginY * 1.16)
  ctx.lineWidth = 1
  ctx.strokeStyle = light ? ink.blue : ink.text
  ctx.globalAlpha = shine * 0.75
  line(ctx, x + 0.5, marginY * 0.65, x + 0.5, height - marginY * 0.65)
}

function draw(ctx, frame, mark, t) {
  const { width, height, radius, compact } = frame
  const exposure = smooth(1.44, 2.31, t)
  const travel = smooth(1.52, 2.54, t)
  const x = width * mix(0.5, compact ? 0.5 : 0.715, travel)
  const y = height * mix(0.46, compact ? 0.397 : 0.49, travel)
  ctx.globalAlpha = 1
  ctx.fillStyle = frame.night
  ctx.fillRect(0, 0, width, height)
  if (exposure < 1) {
    corners(ctx, frame, false)
    ctx.fillStyle = ink.highlight
    ctx.globalAlpha = 0.13
    ctx.fill(frame.darkDots)
  }
  if (exposure > 0) {
    ctx.globalAlpha = exposure
    ctx.fillStyle = frame.paper
    ctx.fillRect(0, 0, width, height)
    if (exposure > 0.64) {
      corners(ctx, frame, true)
      ctx.fillStyle = ink.blue
      ctx.globalAlpha = 0.22
      ctx.fill(frame.lightDots)
    }
  }
  terminal(ctx, frame, x, y, radius * 1.47, mark, t)
  insignia(ctx, frame, x, y, mark, t)
  pass(ctx, frame, t, 0.19, 1.42, false)
  pass(ctx, frame, t, 2.23, 3.76, true)
}

export function startArtwork(canvas, onFailure) {
  const document = canvas.ownerDocument
  const window = document.defaultView
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!window || !ctx) return undefined
  const mark = makeMark(document, window)
  let frame = setup(canvas, ctx, window)
  const started = window.performance.now()
  let request
  let stopped = false

  function stop() {
    stopped = true
    window.cancelAnimationFrame(request)
    window.removeEventListener('resize', resize)
  }

  function resize() {
    try {
      frame = setup(canvas, ctx, window)
    } catch {
      stop()
      onFailure()
    }
  }

  function render(now) {
    if (stopped) return
    try {
      draw(ctx, frame, mark, Math.max(0, (now - started) / 1000))
      request = window.requestAnimationFrame(render)
    } catch {
      stop()
      onFailure()
    }
  }

  window.addEventListener('resize', resize)
  request = window.requestAnimationFrame(render)
  return stop
}
