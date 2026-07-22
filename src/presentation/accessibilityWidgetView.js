// Botón Flotante de Accesibilidad (design_system.md §3, dashboard_design.md §6): fuera de las 3 zonas del Dashboard.
export function buildWidget() {
  const wrapper = document.createElement('div')
  wrapper.className = 'a11y-widget'
  wrapper.innerHTML = `
    <button type="button" class="a11y-toggle ds-button ds-button--primary" aria-label="Abrir panel de accesibilidad" aria-expanded="false">A</button>
    <div class="a11y-panel" hidden>
      <button type="button" class="a11y-contrast-toggle ds-button ds-button--secondary" aria-pressed="false">Modo oscuro</button>
      <div class="a11y-font-controls">
        <button type="button" class="a11y-font-decrease ds-button ds-button--secondary" aria-label="Reducir tamaño de letra">A-</button>
        <span class="a11y-font-percent">100%</span>
        <button type="button" class="a11y-font-increase ds-button ds-button--secondary" aria-label="Aumentar tamaño de letra">A+</button>
      </div>
    </div>
  `
  return wrapper
}

export function updatePanelState(wrapper, { contrast, fontScale }) {
  const contrastButton = wrapper.querySelector('.a11y-contrast-toggle')
  contrastButton.setAttribute('aria-pressed', String(contrast === 'high'))
  contrastButton.textContent = contrast === 'high' ? 'Modo claro' : 'Modo oscuro'
  wrapper.querySelector('.a11y-font-percent').textContent = `${fontScale}%`
}

export function togglePanelVisibility(wrapper) {
  const panel = wrapper.querySelector('.a11y-panel')
  const toggleButton = wrapper.querySelector('.a11y-toggle')
  panel.hidden = !panel.hidden
  toggleButton.setAttribute('aria-expanded', String(!panel.hidden))
}
