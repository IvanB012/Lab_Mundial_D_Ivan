import { ENDPOINTS } from './endpoints.js'
import { coreRequest, HttpError } from './requestCore.js'
import { getToken, clearToken, isTokenExpired } from './auth.js'

// Cliente HTTP (05_shared_infrastructure.md §1): única pieza autorizada a construir peticiones.
export class SessionExpiredError extends Error {
  constructor() {
    super('La sesión expiró: el token fue rechazado (401).')
    this.name = 'SessionExpiredError'
  }
}

// Chequeo proactivo (05_shared_infrastructure.md): no esperar el 401 real si `exp` ya venció.
function guardTokenExpiry(token) {
  if (!isTokenExpired(token)) return
  clearToken()
  throw new SessionExpiredError()
}

// 03_business_rules.md §3: un 401 de sesión ya reemplazada (logout+login en vuelo) no pisa el token nuevo.
function handleUnauthorized(token, error) {
  if (getToken() !== token) throw error
  clearToken()
  throw new SessionExpiredError()
}

async function authenticatedGet(path, cacheKey, onCountdownTick) {
  const token = getToken()
  guardTokenExpiry(token)

  try {
    return await coreRequest(path, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cacheKey,
      onCountdownTick,
    })
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      handleUnauthorized(token, error)
    }
    throw error
  }
}

export async function getGames(onCountdownTick) {
  return authenticatedGet(ENDPOINTS.games, 'games', onCountdownTick)
}

export async function getTeams(onCountdownTick) {
  return authenticatedGet(ENDPOINTS.teams, 'teams', onCountdownTick)
}

export async function getStadiums(onCountdownTick) {
  return authenticatedGet(ENDPOINTS.stadiums, 'stadiums', onCountdownTick)
}

export async function getGroups(onCountdownTick) {
  return authenticatedGet(ENDPOINTS.groups, 'groups', onCountdownTick)
}
