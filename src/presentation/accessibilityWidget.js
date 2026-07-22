import './accessibilityWidget.css'
import { buildWidget, updatePanelState, togglePanelVisibility } from './accessibilityWidgetView.js'
import {
  getStoredContrast,
  setStoredContrast,
  applyContrast,
  getStoredFontScale,
  setStoredFontScale,
  applyFontScale,
  FONT_SCALE_STEPS,
  DEFAULT_FONT_SCALE,
} from './accessibilityPrefs.js'

let contrast = 'normal'
let fontScale = DEFAULT_FONT_SCALE

function wireToggleButton(wrapper) {
  wrapper.querySelector('.a11y-toggle').addEventListener('click', () => togglePanelVisibility(wrapper))
}

function wireContrastButton(wrapper) {
  wrapper.querySelector('.a11y-contrast-toggle').addEventListener('click', () => {
    contrast = contrast === 'high' ? 'normal' : 'high'
    applyContrast(contrast)
    setStoredContrast(contrast)
    updatePanelState(wrapper, { contrast, fontScale })
  })
}

// Clamp entre el primer y el último paso: nunca baja de 25% ni sube de 200% (design_system.md §3).
function changeFontScale(wrapper, direction) {
  const index = FONT_SCALE_STEPS.indexOf(fontScale)
  const nextIndex = Math.min(Math.max(index + direction, 0), FONT_SCALE_STEPS.length - 1)
  fontScale = FONT_SCALE_STEPS[nextIndex]
  applyFontScale(fontScale)
  setStoredFontScale(fontScale)
  updatePanelState(wrapper, { contrast, fontScale })
}

function wireFontButtons(wrapper) {
  wrapper.querySelector('.a11y-font-decrease').addEventListener('click', () => changeFontScale(wrapper, -1))
  wrapper.querySelector('.a11y-font-increase').addEventListener('click', () => changeFontScale(wrapper, 1))
}

export function mountAccessibilityWidget(root) {
  contrast = getStoredContrast()
  fontScale = getStoredFontScale()
  applyContrast(contrast)
  applyFontScale(fontScale)

  const wrapper = buildWidget()
  root.appendChild(wrapper)
  updatePanelState(wrapper, { contrast, fontScale })

  wireToggleButton(wrapper)
  wireContrastButton(wrapper)
  wireFontButtons(wrapper)
}
