import './login.css'
import { login, getToken, isTokenExpired, clearToken } from '../data/auth.js'
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
      <p class="login-session-message login-error" hidden>Tu sesión expiró, inicia sesión de nuevo.</p>
      <label>
        Email
        <input type="email" name="email" required autocomplete="email" />
      </label>
      <label>
        Contraseña
        <input type="password" name="password" required autocomplete="current-password" />
      </label>
      <p class="login-error" hidden></p>
      <button type="submit" class="ds-button ds-button--primary">Entrar</button>
    </form>
  `
  rootElement.appendChild(overlay)

  const form = overlay.querySelector('.login-form')
  const errorEl = overlay.querySelector('.login-error')
  const sessionMessageEl = overlay.querySelector('.login-session-message')

  // Si ya hay un token guardado de una sesión previa (auth.js, Fase 1),
  // se omite el overlay y se arranca directo — sin volver a pedir
  // credenciales en cada refresh. Se valida `exp` localmente (isTokenExpired,
  // sin contactar al servidor): si ya venció, se descarta acá mismo en vez
  // de esperar el primer 401 real. Si el servidor lo rechazara por otra
  // razón (revocado, forjado, etc.), el primer 401 real de cualquier
  // módulo igual dispara SessionExpiredError → 'session':{active:false}
  // → el listener de abajo vuelve a mostrar el overlay (mismo mecanismo
  // de recuperación ya construido para Bug 2).
  const storedToken = getToken()
  if (storedToken && !isTokenExpired(storedToken)) {
    overlay.hidden = true
    hasStartedOnce = true
    publish('session', { active: true })
    onFirstSuccess()
  } else if (storedToken) {
    // Token presente pero vencido (o corrupto): se descarta en silencio,
    // se muestra el login normal — no es una "sesión expirada" activa
    // porque el usuario nunca llegó a usar la app en este arranque.
    clearToken()
  }

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
  // store.js) o a un logout manual (logoutButton.js) volviendo a pedir
  // credenciales. Este evento solo puede llegar después de que el
  // usuario ya empezó a usar la app (loadDomain/logoutButton solo
  // operan post-login), así que hasStartedOnce ya es true en este
  // punto: por eso distingue de forma confiable "reapertura por sesión
  // expirada" de la primera carga, sin necesitar una bandera nueva.
  subscribe('session', ({ active }) => {
    if (!active) {
      sessionMessageEl.hidden = !hasStartedOnce
      overlay.hidden = false
    }
  })
}
