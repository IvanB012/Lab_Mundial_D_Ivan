export const BASE_URL = 'https://worldcup26.ir'

// Prerrequisito del ítem de Login (ROADMAP.md): /auth/* tiene un bug de
// CORS real en el servidor (falta Access-Control-Allow-Origin). En
// desarrollo se sirve vía el proxy de vite.config.js (mismo origen);
// en producción usaría la URL absoluta real, igual que el resto.
export const AUTH_BASE_URL = import.meta.env.DEV ? '/api' : BASE_URL

export const ENDPOINTS = {
  login: '/auth/authenticate',
  register: '/auth/register',
  games: '/get/games',
  teams: '/get/teams',
  stadiums: '/get/stadiums',
  groups: '/get/groups',
}
