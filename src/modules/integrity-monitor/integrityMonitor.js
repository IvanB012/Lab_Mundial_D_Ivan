import { checkEndpointHealth } from '../../state/store.js'
import { renderShell, updateEndpointStatus } from './integrityMonitorView.js'

// Monitor de Integridad (08_integrity_monitor.md): 4 chequeos
// independientes con timeout propio del módulo sobre el envoltorio de
// AbortController, consumido vía store.checkEndpointHealth() — nunca
// src/data/ directamente (02_architecture.md).
const TIMEOUT_MS = 5000

// Rutas tal como las documenta 04_api_contract.md — este módulo no
// importa src/data/endpoints.js (Capa de Datos), así que las declara
// como sus propias constantes locales.
const MONITORED_ENDPOINTS = [
  { key: 'teams', label: 'Equipos', path: '/get/teams' },
  { key: 'groups', label: 'Grupos', path: '/get/groups' },
  { key: 'games', label: 'Partidos', path: '/get/games' },
  { key: 'stadiums', label: 'Estadios', path: '/get/stadiums' },
]

async function checkOne(path) {
  try {
    const response = await checkEndpointHealth(path, TIMEOUT_MS)
    return response.ok ? { state: 'green' } : { state: 'red', reason: `Error ${response.status}` }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { state: 'red', reason: 'Tiempo agotado' }
    }
    return { state: 'red', reason: 'Error de red' }
  }
}

async function runSingleCheck(container, endpoint) {
  const result = await checkOne(endpoint.path)
  updateEndpointStatus(container, endpoint.key, result)
}

// Dispara los 4 chequeos sin esperarse entre sí: un timeout en uno no
// retrasa la actualización visual de los demás (08 §5-6).
function runAllChecks(container) {
  for (const endpoint of MONITORED_ENDPOINTS) {
    updateEndpointStatus(container, endpoint.key, { state: 'checking' })
    runSingleCheck(container, endpoint)
  }
}

export function startIntegrityMonitor() {
  const panelElement = document.querySelector('section[data-module-id="integrity-monitor"]')
  renderShell(panelElement, MONITORED_ENDPOINTS)

  const retryButton = panelElement.querySelector('.integrity-monitor-retry')
  retryButton.addEventListener('click', () => runAllChecks(panelElement))

  runAllChecks(panelElement)
}
