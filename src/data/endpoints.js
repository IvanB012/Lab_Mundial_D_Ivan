// VITE_API_BASE_URL: opcional, solo para apuntar a dev-proxy.cjs durante la defensa oral.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://worldcup26.ir'

// /auth/* tiene un bug de CORS real en el servidor: en desarrollo se sirve vía proxy (ROADMAP.md).
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || (import.meta.env.DEV ? '/api' : BASE_URL)

export const ENDPOINTS = {
  login: '/auth/authenticate',
  register: '/auth/register',
  games: '/get/games',
  teams: '/get/teams',
  stadiums: '/get/stadiums',
  groups: '/get/groups',
}
