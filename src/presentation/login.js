import './login.css'
import { login } from '../data/auth.js'
import { publish, subscribe } from '../state/eventBus.js'

// Pieza de Login (ROADMAP.md, ítem adicional de Fase 3): se dispara una
// sola vez al arrancar, antes de que el usuario acceda al Dashboard.
// Es la única dueña del evento 'session' (05_shared_infrastructure.md §4).
// Vive en Presentación, no en un módulo de dominio — llama a auth.login()
// directamente, excepción explícita documentada en el ROADMAP para esta
// pieza transversal de sesión (distinta de la Capa de Módulos).
export function mountLogin(rootElement, onFirstSuccess) {
  let hasStartedOnce = false

  const overlay = document.createElement('div')
  overlay.className = 'login-overlay'
  overlay.innerHTML = `
    <form class="login-form">
      <h2>Iniciar sesión</h2>
      <label>
        Email
        <input type="email" name="email" required autocomplete="email" />
      </label>
      <label>
        Contraseña
        <input type="password" name="password" required autocomplete="current-password" />
      </label>
      <p class="login-error" hidden></p>
      <button type="submit">Entrar</button>
    </form>
  `
  rootElement.appendChild(overlay)

  const form = overlay.querySelector('.login-form')
  const errorEl = overlay.querySelector('.login-error')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.hidden = true

    try {
      await login(form.elements.email.value, form.elements.password.value)
      publish('session', { active: true })
      overlay.hidden = true
      if (!hasStartedOnce) {
        hasStartedOnce = true
        onFirstSuccess()
      }
    } catch (error) {
      errorEl.textContent = 'Credenciales incorrectas o error de conexión.'
      errorEl.hidden = false
    }
  })

  // Reacciona a un 401 real de cualquier módulo (publicado desde
  // store.js, no desde aquí) volviendo a pedir credenciales.
  subscribe('session', ({ active }) => {
    if (!active) {
      overlay.hidden = false
    }
  })
}
