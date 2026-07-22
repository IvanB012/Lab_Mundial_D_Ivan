import './login.css'
import { login, getToken, isTokenExpired, clearToken } from '../data/auth.js'
import { publish, subscribe } from '../state/eventBus.js'

// Pieza de Login (ROADMAP.md, ítem adicional de Fase 3): única dueña del evento 'session'.
let hasStartedOnce = false

// Fase 8 Parte B: fuente única del texto (05_shared_infrastructure.md §4, vocabulario de reason).
const EXPIRED_MESSAGE = 'Tu sesión expiró, inicia sesión de nuevo.'
const MANUAL_MESSAGE = 'Cerraste sesión correctamente. Inicia sesión de nuevo para continuar.'

function buildLoginOverlay() {
  const overlay = document.createElement('div')
  overlay.className = 'login-overlay'
  overlay.innerHTML = `
    <form class="login-form">
      <h2>Iniciar sesión</h2>
      <p class="login-session-message login-error" aria-live="polite" hidden></p>
      <label for="login-email">
        Email
        <input id="login-email" type="email" name="email" required autocomplete="email" />
      </label>
      <label for="login-password">
        Contraseña
        <input id="login-password" type="password" name="password" required autocomplete="current-password" />
      </label>
      <p class="login-error" hidden></p>
      <button type="submit" class="ds-button ds-button--primary">Entrar</button>
    </form>
  `
  return overlay
}

// Chequeo local del `exp` del JWT (auth.js), sin contactar al servidor (Fase 7 Parte D).
function checkStoredSession() {
  const storedToken = getToken()
  if (storedToken && !isTokenExpired(storedToken)) return true
  if (storedToken) clearToken()
  return false
}

function resumeStoredSession(overlay, onFirstSuccess) {
  overlay.hidden = true
  hasStartedOnce = true
  publish('session', { active: true, reason: 'initial' })
  onFirstSuccess()
}

function handleLoginSuccess(overlay, onFirstSuccess) {
  publish('session', { active: true, reason: 'login' })
  overlay.hidden = true
  // Fase 8 Parte F: blur() no reinicia el punto de partida del Tab en Chromium; enfocar <body> sí.
  document.body.setAttribute('tabindex', '-1')
  document.body.focus()
  if (!hasStartedOnce) {
    hasStartedOnce = true
    onFirstSuccess()
  }
}

function handleLoginFailure(errorEl) {
  errorEl.textContent = 'Credenciales incorrectas o error de conexión.'
  errorEl.hidden = false
}

function wireSubmit(form, overlay, errorEl, onFirstSuccess) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorEl.hidden = true
    try {
      await login(form.elements.email.value, form.elements.password.value)
      handleLoginSuccess(overlay, onFirstSuccess)
    } catch (error) {
      handleLoginFailure(errorEl)
    }
  })
}

function clearCredentialFields(form) {
  form.elements.email.value = ''
  form.elements.password.value = ''
}

// Reapertura por cualquier motivo (401 real, logout manual, token inválido): texto según reason, campos limpios.
function wireSessionListener(overlay, sessionMessageEl, form) {
  subscribe('session', ({ active, reason }) => {
    if (active) return
    sessionMessageEl.textContent = reason === 'manual' ? MANUAL_MESSAGE : EXPIRED_MESSAGE
    sessionMessageEl.hidden = false
    clearCredentialFields(form)
    overlay.hidden = false
  })
}

export function mountLogin(rootElement, onFirstSuccess) {
  const overlay = buildLoginOverlay()
  rootElement.appendChild(overlay)

  const form = overlay.querySelector('.login-form')
  const errorEl = overlay.querySelector('.login-error')
  const sessionMessageEl = overlay.querySelector('.login-session-message')

  if (checkStoredSession()) {
    resumeStoredSession(overlay, onFirstSuccess)
  }

  wireSubmit(form, overlay, errorEl, onFirstSuccess)
  wireSessionListener(overlay, sessionMessageEl, form)
}
