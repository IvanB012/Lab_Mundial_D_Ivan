import { MODULE_TABS } from './moduleTabs.js'

// Zona de Contenido (dashboard_design.md §2, layout.md §4). Los cinco
// paneles se crean una sola vez y se alternan con `hidden`: cambiar de
// pestaña nunca destruye ni recrea el DOM de los módulos en segundo plano
// (dashboard_design.md §4), dejando el polling futuro de cada módulo intacto.
export function mountContentArea(container) {
  container.innerHTML = `
    <div class="content-area">
      ${MODULE_TABS.map(
        (tab, index) => `
        <section
          class="module-panel"
          data-module-id="${tab.id}"
          ${index === 0 ? '' : 'hidden'}
        >
          <p class="module-placeholder">${tab.label} — pendiente (Fase 3)</p>
        </section>
      `,
      ).join('')}
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
