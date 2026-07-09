import { loadGames } from '../../state/store.js'
import { publish } from '../../state/eventBus.js'
import { showToast } from '../../presentation/toast.js'
import { renderGames } from './liveTickerView.js'

// Live Ticker (06_live_ticker.md): polling con backoff exponencial sobre
// GET /get/games, comparación de marcadores y notificaciones no bloqueantes.
// Solo publica 'countdown' y 'offline' — 'session' es una responsabilidad
// transversal fuera del dominio de este módulo (pendiente a nivel de sistema).
const POLL_INTERVAL_MS = 15000

let panelElement = null
let previousGamesById = null
let backoffToastShown = false
let stopped = false

function indexById(games) {
  const map = new Map()
  for (const game of games) map.set(game.id, game)
  return map
}

function notifyScoreChanges(previousMap, games) {
  if (!previousMap) return
  for (const game of games) {
    const previous = previousMap.get(game.id)
    if (!previous) continue
    const scoreChanged =
      previous.home_score !== game.home_score || previous.away_score !== game.away_score
    if (scoreChanged) {
      showToast(
        `${game.home_team_name_en} ${game.home_score} - ${game.away_score} ${game.away_team_name_en}`,
        { type: 'info' },
      )
    }
  }
}

function handleCountdownTick(secondsRemaining) {
  publish('countdown', { secondsRemaining })
  if (!backoffToastShown) {
    showToast('Actualización en pausa — reintentando…', { type: 'warning' })
    backoffToastShown = true
  }
}

async function pollOnce() {
  try {
    const result = await loadGames(handleCountdownTick)
    publish('countdown', { secondsRemaining: 0 })
    publish('offline', { stale: result.stale })
    backoffToastShown = false

    const games = result.data.games
    // El estado anterior se actualiza solo después de comparar, para no
    // perder la referencia del siguiente ciclo (06_live_ticker.md §6).
    notifyScoreChanges(previousGamesById, games)
    renderGames(panelElement, games)
    previousGamesById = indexById(games)
  } catch (error) {
    publish('countdown', { secondsRemaining: 0 })
    backoffToastShown = false

    if (error.name === 'SessionExpiredError') {
      showToast('Sesión expirada: el Live Ticker se detuvo hasta reautenticarse.', {
        type: 'error',
      })
      stopped = true
      return
    }

    // Error no recuperable en este ciclo (ej. sin caché disponible aún):
    // el panel no se congela ni se borra, solo se reintenta en el siguiente ciclo.
    showToast('No se pudo actualizar el Live Ticker; se reintentará automáticamente.', {
      type: 'warning',
    })
  }

  if (!stopped) {
    setTimeout(pollOnce, POLL_INTERVAL_MS)
  }
}

export function startLiveTicker() {
  panelElement = document.querySelector('section[data-module-id="live-ticker"]')
  pollOnce()
}
