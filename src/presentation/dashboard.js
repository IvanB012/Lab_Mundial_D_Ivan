import './dashboard.css'
import { mountStatusBar } from './statusBar.js'
import { mountLogoutButton } from './logoutButton.js'
import { mountTabBar } from './tabBar.js'
import { mountContentArea } from './contentArea.js'

// Orquestador mínimo del esqueleto visual (Fase 2). No implementa
// contenido funcional de ningún módulo.
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
  const content = mountContentArea(root.querySelector('.dashboard-content-area'))
  mountTabBar(root.querySelector('.dashboard-tab-bar'), content.showModule)
}
