import { clearToken } from '../data/auth.js'
import { clearCache } from '../data/cache.js'
import { publish } from '../state/eventBus.js'

// Cierre de sesión manual (ROADMAP.md Fase 6 Parte B): dispara el mismo mecanismo que un 401 real.
export function mountLogoutButton(container) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'ds-button ds-button--secondary logout-button'
  button.textContent = 'Cerrar sesión'

  button.addEventListener('click', () => {
    clearToken()
    clearCache()
    publish('session', { active: false, reason: 'manual' })
  })

  container.appendChild(button)
}
