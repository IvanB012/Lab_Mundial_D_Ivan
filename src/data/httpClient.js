import { ENDPOINTS } from './endpoints.js'
import { coreRequest, HttpError } from './requestCore.js'
import { getToken, clearToken, isTokenExpired } from './auth.js'

// Cliente HTTP (05_shared_infrastructure.md §1): única pieza autorizada
// a construir y enviar peticiones a los endpoints de datos.
export class SessionExpiredError extends Error {
  constructor() {
    super('La sesión expiró: el token fue rechazado (401).')
    this.name = 'SessionExpiredError'
  }
}

async function authenticatedGet(path, cacheKey, onCountdownTick) {
  const token = getToken()

  // Chequeo proactivo (05_shared_infrastructure.md): si el token ya
  // expiró según su propio `exp`, no tiene sentido esperar el 401 real
  // de la API para reaccionar.
  if (isTokenExpired(token)) {
    clearToken()
    throw new SessionExpiredError()
  }

  try {
    return await coreRequest(path, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cacheKey,
      onCountdownTick,
    })
  } catch (error) {
    // 03_business_rules.md §3: ante 401, limpiar el token guardado.
    // Nunca window.location.reload() — el caller decide cómo reautenticar.
    if (error instanceof HttpError && error.status === 401) {
      // Si el token vigente ya cambió (logout + login nuevo mientras esta
      // petición seguía en vuelo), este 401 es de una sesión que ya no
      // existe: no debe pisar el token que la reemplazó.
      if (getToken() !== token) {
        throw error
      }
      clearToken()
      throw new SessionExpiredError()
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
