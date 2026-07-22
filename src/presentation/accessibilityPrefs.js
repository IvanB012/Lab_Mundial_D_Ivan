const CONTRAST_KEY = 'wc26_contrast'
const FONT_SCALE_KEY = 'wc26_font_scale'

// Pasos fijos con tope mínimo/máximo (design_system.md §3): nunca baja de 25% ni sube de 200%.
export const FONT_SCALE_STEPS = [25, 50, 75, 100, 125, 150, 175, 200]
export const DEFAULT_FONT_SCALE = 100

export function getStoredContrast() {
  return localStorage.getItem(CONTRAST_KEY) === 'high' ? 'high' : 'normal'
}

export function setStoredContrast(value) {
  localStorage.setItem(CONTRAST_KEY, value)
}

export function getStoredFontScale() {
  const stored = Number(localStorage.getItem(FONT_SCALE_KEY))
  return FONT_SCALE_STEPS.includes(stored) ? stored : DEFAULT_FONT_SCALE
}

export function setStoredFontScale(value) {
  localStorage.setItem(FONT_SCALE_KEY, String(value))
}

// Modificador global sobre las variables de color ya existentes (design_system.md §3), sin duplicar por componente.
export function applyContrast(value) {
  document.documentElement.setAttribute('data-contrast', value)
}

// Unidad relativa (%): reescala todo el texto en rem de golpe, sin tocar CSS de ningún componente.
export function applyFontScale(value) {
  document.documentElement.style.fontSize = `${value}%`
}
