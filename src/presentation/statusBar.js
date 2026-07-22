import { subscribe } from '../state/eventBus.js'

// Barra de Estado Global (dashboard_design.md §2-3, layout.md §2): solo consume el Sistema de Eventos.
const viewState = {
  sessionActive: null, // null = sin datos todavía (ningún módulo ha publicado aún)
  secondsRemaining: null,
  stale: false,
}

function renderSessionSection(root) {
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
}

function renderCountdownSection(root) {
  const countdownSection = root.querySelector('[data-section="countdown"]')
  if (viewState.secondsRemaining === null) {
    countdownSection.hidden = true
    countdownSection.innerHTML = ''
    return
  }
  countdownSection.hidden = false
  countdownSection.innerHTML = `
    <span class="status-label-full ds-countdown">Reintentando en ${viewState.secondsRemaining}s</span>
    <span class="status-label-abbr ds-countdown">${viewState.secondsRemaining}s</span>
  `
}

function renderOfflineSection(root) {
  const offlineSection = root.querySelector('[data-section="offline"]')
  if (!viewState.stale) {
    offlineSection.hidden = true
    offlineSection.innerHTML = ''
    return
  }
  offlineSection.hidden = false
  offlineSection.innerHTML = `
    <span class="status-label-full ds-offline">Datos no actualizados</span>
    <span class="status-label-abbr ds-offline">Offline</span>
  `
}

function render(root) {
  renderSessionSection(root)
  renderCountdownSection(root)
  renderOfflineSection(root)
}

function buildStatusBarMarkup() {
  return `
    <div class="status-bar">
      <div class="status-section" data-section="session" aria-live="polite"></div>
      <div class="status-section" data-section="countdown" aria-live="polite" hidden></div>
      <div class="status-section" data-section="offline" aria-live="polite" hidden></div>
    </div>
  `
}

function wireStatusSubscriptions(container) {
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
}

export function mountStatusBar(container) {
  container.innerHTML = buildStatusBarMarkup()
  wireStatusSubscriptions(container)
  render(container)
}
