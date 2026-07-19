import { clearToken } from '../data/auth.js'
import { clearCache } from '../data/cache.js'
import { publish } from '../state/eventBus.js'

// Cierre de sesión manual (ROADMAP.md Fase 6, Parte B). Dispara
// exactamente el mismo mecanismo que un 401 real (clearToken() +
// publish('session', {active:false})), en vez de un flujo propio.
// No lee ni guarda estado de sesión: statusBar.js sigue siendo la
// única fuente de verdad de lo que se muestra sobre la sesión, esta
// pieza solo dispara la acción.
export function mountLogoutButton(container) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'ds-button ds-button--secondary logout-button'
  button.textContent = 'Cerrar sesión'

  button.addEventListener('click', () => {
    clearToken()
    clearCache()
    publish('session', { active: false })
  })

  container.appendChild(button)
}
