// Renderizado del semáforo (design_system.md §3): pinta status.state/reason, no decide el estado.
function renderStatusMarkup(status) {
  const semaphore = `<span class="ds-semaphore ds-semaphore--${status.state === 'green' ? 'green' : status.state === 'red' ? 'red' : 'checking'}"></span>`

  if (status.state === 'checking') return `${semaphore}En verificación…`
  if (status.state === 'green') return `${semaphore}Verde`
  return `${semaphore}Rojo — <span class="ds-badge ds-badge--error">${status.reason}</span>`
}

function buildEndpointItemMarkup(endpoint) {
  return `
          <li data-endpoint-key="${endpoint.key}">
            <span class="integrity-monitor-label">${endpoint.label}</span>
            <span class="integrity-monitor-status"><span class="ds-semaphore ds-semaphore--checking"></span>En verificación…</span>
          </li>
        `
}

export function renderShell(container, endpoints) {
  if (!container) return

  container.innerHTML = `
    <div class="integrity-monitor">
      <ul class="integrity-monitor-list">
        ${endpoints.map(buildEndpointItemMarkup).join('')}
      </ul>
      <button type="button" class="integrity-monitor-retry ds-button ds-button--primary">Reintentar</button>
    </div>
  `
}

// Actualiza una sola fila sin re-renderizar el resto (08 §5-6).
export function updateEndpointStatus(container, key, status) {
  if (!container) return
  const statusEl = container.querySelector(
    `[data-endpoint-key="${key}"] .integrity-monitor-status`,
  )
  if (!statusEl) return
  statusEl.innerHTML = renderStatusMarkup(status)
}
