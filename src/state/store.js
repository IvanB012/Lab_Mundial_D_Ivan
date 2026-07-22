import { getGames, getTeams, getStadiums, getGroups } from '../data/httpClient.js'
import { fetchWithTimeout } from '../data/timeoutFetch.js'
import { getToken, clearToken } from '../data/auth.js'
import { BASE_URL } from '../data/endpoints.js'
import { publish, subscribe } from './eventBus.js'

// Gestor de Estado Global (05_shared_infrastructure.md §2): mantiene y notifica vía Sistema de Eventos.
const state = {
  games: null,
  teams: null,
  stadiums: null,
  groups: null,
}

export function getState(domain) {
  return state[domain]
}

export function subscribeToState(domain, callback) {
  return subscribe(domain, callback)
}

function setState(domain, result) {
  state[domain] = result
  publish(domain, result)
}

// Wrapper compartido: ante SessionExpiredError, publica 'session':{active:false} una sola vez y re-lanza (02_architecture.md).
async function loadDomain(domain, fetcher, onCountdownTick) {
  try {
    const result = await fetcher(onCountdownTick)
    setState(domain, result)
    return result
  } catch (error) {
    if (error.name === 'SessionExpiredError') {
      publish('session', { active: false, reason: 'expired' })
    }
    throw error
  }
}

export async function loadGames(onCountdownTick) {
  return loadDomain('games', getGames, onCountdownTick)
}

export async function loadTeams(onCountdownTick) {
  return loadDomain('teams', getTeams, onCountdownTick)
}

export async function loadStadiums(onCountdownTick) {
  return loadDomain('stadiums', getStadiums, onCountdownTick)
}

export async function loadGroups(onCountdownTick) {
  return loadDomain('groups', getGroups, onCountdownTick)
}

// Pass-through consciente (02_architecture.md): un ping de diagnóstico no es dominio vigente, no se guarda en `state`.
export async function checkEndpointHealth(path, timeoutMs) {
  const token = getToken()
  const response = await fetchWithTimeout(
    `${BASE_URL}${path}`,
    { headers: { Authorization: `Bearer ${token}` } },
    timeoutMs,
  )
  if (response.status === 401) {
    clearToken()
    publish('session', { active: false, reason: 'expired' })
  }
  return response
}
