import { getGames, getTeams, getStadiums, getGroups } from '../data/httpClient.js'
import { fetchWithTimeout } from '../data/timeoutFetch.js'
import { getToken } from '../data/auth.js'
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

export async function loadGames(onCountdownTick) {
  const result = await getGames(onCountdownTick)
  setState('games', result)
  return result
}

export async function loadTeams(onCountdownTick) {
  const result = await getTeams(onCountdownTick)
  setState('teams', result)
  return result
}

export async function loadStadiums(onCountdownTick) {
  const result = await getStadiums(onCountdownTick)
  setState('stadiums', result)
  return result
}

export async function loadGroups(onCountdownTick) {
  const result = await getGroups(onCountdownTick)
  setState('groups', result)
  return result
}

// Pass-through consciente para el Monitor de Integridad: un ping de
// diagnóstico no es información "vigente" de ningún dominio (no encaja
// junto a games/teams/stadiums/groups), así que no se guarda en `state`
// ni se publica en el Sistema de Eventos. Existe únicamente para que los
// módulos nunca accedan a src/data/ directamente (02_architecture.md) —
// delega en fetchWithTimeout/getToken/BASE_URL ya construidos en Fase 1
// sin duplicar su lógica. No interpreta el resultado (verde/rojo/timeout
// es decisión del módulo que llama, no de la Capa de Estado).
export async function checkEndpointHealth(path, timeoutMs) {
  const token = getToken()
  return fetchWithTimeout(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } }, timeoutMs)
}
