import { ENDPOINTS } from './endpoints.js'
import { coreRequest } from './requestCore.js'

const TOKEN_STORAGE_KEY = 'wc26_auth_token'

// Componente de Autenticación (05_shared_infrastructure.md §5).
// Obtiene y almacena el token JWT; el manejo del 401 vive en httpClient.js.
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

async function authenticate(path, credentials) {
  const { data } = await coreRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: credentials,
  })
  setToken(data.token)
  return data
}

export async function login(email, password) {
  return authenticate(ENDPOINTS.login, { email, password })
}

export async function register(name, email, password) {
  return authenticate(ENDPOINTS.register, { name, email, password })
}
