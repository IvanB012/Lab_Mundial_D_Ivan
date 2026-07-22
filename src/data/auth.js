import { ENDPOINTS, AUTH_BASE_URL } from './endpoints.js'
import { coreRequest } from './requestCore.js'

const TOKEN_STORAGE_KEY = 'wc26_auth_token'

// Componente de Autenticación (05_shared_infrastructure.md §5): obtiene y almacena el token JWT.
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

// Decodifica el payload del JWT para leer `exp`, sin verificar firma (03_business_rules.md §1).
function decodePayload(token) {
  const payloadB64 = token.split('.')[1]
  if (!payloadB64) throw new Error('Token sin payload: no tiene forma de JWT.')
  const padded = payloadB64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), '=')
  return JSON.parse(atob(padded))
}

export function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = decodePayload(token)
    if (!payload?.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true // token corrupto/ilegible se trata como expirado
  }
}

async function authenticate(path, credentials) {
  const { data } = await coreRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: credentials,
    baseUrl: AUTH_BASE_URL,
  })
  if (!data.token) {
    throw new Error('La API no devolvió un token en la respuesta de autenticación.')
  }
  setToken(data.token)
  return data
}

export async function login(email, password) {
  return authenticate(ENDPOINTS.login, { email, password })
}

export async function register(name, email, password) {
  return authenticate(ENDPOINTS.register, { name, email, password })
}
