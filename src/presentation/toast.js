const CONTAINER_ID = 'wc26-toast-container'

// Sistema de Notificaciones (05_shared_infrastructure.md §6): mensajes no bloqueantes, nunca alert().
function getContainer() {
  let container = document.getElementById(CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.id = CONTAINER_ID
    container.setAttribute('aria-live', 'polite')
    document.body.appendChild(container)
  }
  return container
}

export function showToast(message, { type = 'info', durationMs = 4000 } = {}) {
  const container = getContainer()
  const toastEl = document.createElement('div')
  toastEl.className = `wc26-toast wc26-toast--${type}`
  toastEl.textContent = message
  container.appendChild(toastEl)
  setTimeout(() => {
    toastEl.remove()
  }, durationMs)
  return toastEl
}
