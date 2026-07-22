import './dashboard.css'
import { mountStatusBar } from './statusBar.js'
import { mountLogoutButton } from './logoutButton.js'
import { mountTabBar } from './tabBar.js'
import { mountContentArea } from './contentArea.js'
import { MODULE_TABS } from './moduleTabs.js'
import { getStoredActiveTab } from './activeTab.js'

// Orquestador mínimo del esqueleto visual (Fase 2): no implementa contenido funcional de ningún módulo.
export function mountDashboard(root) {
  root.innerHTML = `
    <div class="dashboard">
      <header class="dashboard-status-bar"></header>
      <nav class="dashboard-tab-bar"></nav>
      <main class="dashboard-content-area"></main>
    </div>
  `

  mountStatusBar(root.querySelector('.dashboard-status-bar'))
  mountLogoutButton(root.querySelector('.dashboard-status-bar'))

  // Única lectura de la pestaña guardada (Fase 8 Parte E): evita desincronizar tabBar.js/contentArea.js.
  const activeTabId = getStoredActiveTab(MODULE_TABS.map((tab) => tab.id))
  const content = mountContentArea(root.querySelector('.dashboard-content-area'), activeTabId)
  mountTabBar(root.querySelector('.dashboard-tab-bar'), content.showModule, activeTabId)
}
