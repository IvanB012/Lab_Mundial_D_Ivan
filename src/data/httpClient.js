import { ENDPOINTS } from './endpoints.js'
import { coreRequest, HttpError } from './requestCore.js'
import { getToken, clearToken } from './auth.js'

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
