// Colors by role from docs/assets/agnes-color-palette.json.
export const ink = {
  night: '#14152A',
  background: '#15161A',
  haze: '#252845',
  mark: '#6983FC',
  highlight: '#A5ACFF',
  text: '#E6E7EA',
  white: '#FFFFFF',
  paper: '#F3F3F1',
  tint: '#EEF0FC',
  blue: '#3248AF',
  focus: '#4F5BD5',
}

export const PLAYBACK_MS = 4700
export const BRAND_MS = 2380
export const FADE_MS = 420
export const TAU = Math.PI * 2
export const mix = (a, b, amount) => a + (b - a) * amount

export function noise(index) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

export function smooth(from, to, value) {
  const progress = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return progress * progress * (3 - 2 * progress)
}
