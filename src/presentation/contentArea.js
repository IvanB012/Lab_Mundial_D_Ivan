import { MODULE_TABS } from './moduleTabs.js'

// Zona de Contenido (dashboard_design.md §2, layout.md §4): paneles fijos alternados con `hidden`.
function buildPanelMarkup(tab, activeTabId) {
  return `
    <section
      class="module-panel"
      data-module-id="${tab.id}"
      ${tab.id === activeTabId ? '' : 'hidden'}
    >
      <p class="module-placeholder">${tab.loadingMessage}</p>
    </section>
  `
}

export function mountContentArea(container, activeTabId) {
  container.innerHTML = `
    <div class="content-area">
      ${MODULE_TABS.map((tab) => buildPanelMarkup(tab, activeTabId)).join('')}
    </div>
  `

  const panels = container.querySelectorAll('.module-panel')

  return {
    showModule(moduleId) {
      for (const panel of panels) {
        panel.hidden = panel.dataset.moduleId !== moduleId
      }
    },
  }
}
