// Renderizado del panel de Monitor de Integridad — solo texto plano,
// sin color todavía (el semáforo visual a color llega en Fase 4).
function renderStatusText(status) {
  if (status.state === 'checking') return 'En verificación…'
  if (status.state === 'green') return 'Verde'
  return `Rojo — ${status.reason}`
}

export function renderShell(container, endpoints) {
  if (!container) return

  container.innerHTML = `
    <div class="integrity-monitor">
      <ul class="integrity-monitor-list">
        ${endpoints
          .map(
            (endpoint) => `
          <li data-endpoint-key="${endpoint.key}">
            <span class="integrity-monitor-label">${endpoint.label}</span>
            <span class="integrity-monitor-status">En verificación…</span>
          </li>
        `,
          )
          .join('')}
      </ul>
      <button type="button" class="integrity-monitor-retry">Reintentar</button>
    </div>
  `
}

// Actualiza una sola fila sin re-renderizar el resto: un timeout en un
// endpoint no debe afectar la fila ya resuelta de otro (08 §5-6).
export function updateEndpointStatus(container, key, status) {
  if (!container) return
  const statusEl = container.querySelector(
    `[data-endpoint-key="${key}"] .integrity-monitor-status`,
  )
  if (!statusEl) return
  statusEl.textContent = renderStatusText(status)
}
