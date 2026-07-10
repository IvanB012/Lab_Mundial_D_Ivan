import { subscribe } from '../state/eventBus.js'

// Barra de Estado Global (dashboard_design.md §2, layout.md §2).
// Se alimenta exclusivamente del Sistema de Eventos de src/state/ — nunca
// consulta src/data/ ni a ningún módulo directamente (dashboard_design.md §3).
// Vocabulario de topics fijado en 05_shared_infrastructure.md §4.
const viewState = {
  sessionActive: null, // null = sin datos todavía (ningún módulo ha publicado aún)
  secondsRemaining: null,
  stale: false,
}

function render(root) {
  const sessionText =
    viewState.sessionActive === null
      ? 'Sesión: sin datos'
      : viewState.sessionActive
        ? 'Sesión activa'
        : 'Sesión expirada'

  const sessionClass = viewState.sessionActive ? 'ds-session-active' : 'ds-session-inactive'
  root.querySelector('[data-section="session"]').innerHTML = `
    <span class="status-label-full ${sessionClass}">${sessionText}</span>
    <span class="status-label-abbr ${sessionClass}">${viewState.sessionActive ? 'Activo' : 'Sesión'}</span>
  `

  const countdownSection = root.querySelector('[data-section="countdown"]')
  if (viewState.secondsRemaining !== null) {
    countdownSection.hidden = false
    countdownSection.innerHTML = `
      <span class="status-label-full ds-countdown">Reintentando en ${viewState.secondsRemaining}s</span>
      <span class="status-label-abbr ds-countdown">${viewState.secondsRemaining}s</span>
    `
  } else {
    countdownSection.hidden = true
    countdownSection.innerHTML = ''
  }

  const offlineSection = root.querySelector('[data-section="offline"]')
  if (viewState.stale) {
    offlineSection.hidden = false
    offlineSection.innerHTML = `
      <span class="status-label-full ds-offline">Datos no actualizados</span>
      <span class="status-label-abbr ds-offline">Offline</span>
    `
  } else {
    offlineSection.hidden = true
    offlineSection.innerHTML = ''
  }
}

export function mountStatusBar(container) {
  container.innerHTML = `
    <div class="status-bar">
      <div class="status-section" data-section="session"></div>
      <div class="status-section" data-section="countdown" hidden></div>
      <div class="status-section" data-section="offline" hidden></div>
    </div>
  `

  subscribe('session', ({ active }) => {
    viewState.sessionActive = active
    render(container)
  })

  subscribe('countdown', ({ secondsRemaining }) => {
    viewState.secondsRemaining = secondsRemaining > 0 ? secondsRemaining : null
    render(container)
  })

  subscribe('offline', ({ stale }) => {
    viewState.stale = stale
    render(container)
  })

  render(container)
}
