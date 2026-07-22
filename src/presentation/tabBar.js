import { MODULE_TABS } from './moduleTabs.js'
import { setStoredActiveTab } from './activeTab.js'

function buildTabButtonMarkup(tab, activeTabId) {
  return `
    <button
      type="button"
      class="tab-button"
      role="tab"
      data-module-id="${tab.id}"
      aria-selected="${tab.id === activeTabId}"
    >${tab.label}</button>
  `
}

function setActiveButton(buttons, moduleId) {
  for (const button of buttons) {
    button.setAttribute('aria-selected', String(button.dataset.moduleId === moduleId))
  }
}

function wireTabButtons(buttons, onChange) {
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const moduleId = button.dataset.moduleId
      setActiveButton(buttons, moduleId)
      setStoredActiveTab(moduleId)
      onChange(moduleId)
    })
  }
}

// Barra de Pestañas (dashboard_design.md §1, layout.md §3): solo notifica la intención de cambio.
export function mountTabBar(container, onChange, activeTabId) {
  container.innerHTML = `
    <div class="tab-bar" role="tablist">
      ${MODULE_TABS.map((tab) => buildTabButtonMarkup(tab, activeTabId)).join('')}
    </div>
  `

  const buttons = container.querySelectorAll('.tab-button')
  wireTabButtons(buttons, onChange)
}
