import { getGames, getTeams, getStadiums, getGroups } from '../data/httpClient.js'
import { fetchWithTimeout } from '../data/timeoutFetch.js'
import { getToken, clearToken } from '../data/auth.js'
import { BASE_URL } from '../data/endpoints.js'
import { publish, subscribe } from './eventBus.js'

// Gestor de Estado Global (05_shared_infrastructure.md §2): mantiene en
// memoria la información vigente por dominio y notifica a los suscritos
// vía el Sistema de Eventos, en lugar de que cada módulo consulte activamente.
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

// Wrapper compartido: si cualquier dominio recibe un SessionExpiredError
// (401, ya construido en Fase 1), se publica 'session':{active:false}
// UNA SOLA VEZ desde aquí — la Capa de Estado es quien notifica a los
// módulos suscritos (02_architecture.md), no cada módulo por separado.
// El error se re-lanza sin modificar para que el módulo siga
// manejándolo exactamente igual que antes (ej. Live Ticker mostrando
// su propio toast y deteniendo el polling).
async function loadDomain(domain, fetcher, onCountdownTick) {
  try {
    const result = await fetcher(onCountdownTick)
    setState(domain, result)
    return result
  } catch (error) {
    if (error.name === 'SessionExpiredError') {
      publish('session', { active: false })
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

// Pass-through consciente para el Monitor de Integridad: un ping de
// diagnóstico no es información "vigente" de ningún dominio (no encaja
// junto a games/teams/stadiums/groups), así que no se guarda en `state`
// ni se publica en el Sistema de Eventos. Existe únicamente para que los
// módulos nunca accedan a src/data/ directamente (02_architecture.md) —
// delega en fetchWithTimeout/getToken/BASE_URL ya construidos en Fase 1
// sin duplicar su lógica. No interpreta verde/rojo/timeout (eso sigue
// siendo decisión del módulo que llama), salvo el 401: igual que
// loadDomain() para el resto de los dominios, un 401 es sesión vencida
// sin importar qué endpoint lo devolvió, así que dispara el mismo evento
// 'session' que ya escuchan login.js y el resto de los módulos.
export async function checkEndpointHealth(path, timeoutMs) {
  const token = getToken()
  const response = await fetchWithTimeout(
    `${BASE_URL}${path}`,
    { headers: { Authorization: `Bearer ${token}` } },
    timeoutMs,
  )
  if (response.status === 401) {
    clearToken()
    publish('session', { active: false })
  }
  return response
}
