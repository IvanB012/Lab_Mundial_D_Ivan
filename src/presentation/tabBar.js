import { MODULE_TABS } from './moduleTabs.js'

// Barra de Pestañas (dashboard_design.md §1, layout.md §3). Solo notifica
// la intención de cambio; nunca decide qué mostrar (02_architecture.md §3).
export function mountTabBar(container, onChange) {
  container.innerHTML = `
    <div class="tab-bar" role="tablist">
      ${MODULE_TABS.map(
        (tab, index) => `
        <button
          type="button"
          class="tab-button"
          role="tab"
          data-module-id="${tab.id}"
          aria-selected="${index === 0}"
        >${tab.label}</button>
      `,
      ).join('')}
    </div>
  `

  const buttons = container.querySelectorAll('.tab-button')

  const setActive = (moduleId) => {
    for (const button of buttons) {
      button.setAttribute('aria-selected', String(button.dataset.moduleId === moduleId))
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const moduleId = button.dataset.moduleId
      setActive(moduleId)
      onChange(moduleId)
    })
  }
}
