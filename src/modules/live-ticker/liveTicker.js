import './liveTicker.css'
import { loadGames } from '../../state/store.js'
import { publish, subscribe } from '../../state/eventBus.js'
import { showToast } from '../../presentation/toast.js'
import { renderGames, renderLoadFailure } from './liveTickerView.js'

// Live Ticker (06_live_ticker.md): polling con backoff exponencial sobre GET /get/games.
const POLL_INTERVAL_MS = 15000

// Mismo texto y enriquecimiento que knockoutTree.js, para consistencia entre módulos.
const PENDING_LABEL = 'Por definir'

let panelElement = null
let previousGamesById = null
let backoffToastShown = false
let stopped = false

function indexById(games) {
  const map = new Map()
  for (const game of games) map.set(game.id, game)
  return map
}

function translateSlotLabel(label) {
  if (!label) return null
  return label
    .replace(/^Winner Group (\w+)$/, 'Ganador del Grupo $1')
    .replace(/^Runner-up Group (\w+)$/, 'Segundo del Grupo $1')
    .replace(/^Winner Match (\d+)$/, 'Ganador del Partido $1')
    .replace(/^Loser Match (\d+)$/, 'Perdedor del Partido $1')
}

function resolveTeamLabel(game, side) {
  const teamId = game[`${side}_team_id`]
  if (teamId === '0') {
    const translated = translateSlotLabel(game[`${side}_team_label`])
    return translated ? `${PENDING_LABEL} (${translated})` : PENDING_LABEL
  }
  return game[`${side}_team_name_en`]
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
        `${resolveTeamLabel(game, 'home')} ${game.home_score} - ${game.away_score} ${resolveTeamLabel(game, 'away')}`,
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

function buildGameViewModel(game) {
  return {
    ...game,
    homeLabel: resolveTeamLabel(game, 'home'),
    awayLabel: resolveTeamLabel(game, 'away'),
    // Partido no iniciado: "vs" en vez de "0 - 0" para no confundirlo con un resultado real.
    scoreText: game.finished === 'TRUE' ? `${game.home_score} - ${game.away_score}` : 'vs',
  }
}

function handlePollSuccess(result) {
  publish('countdown', { secondsRemaining: 0 })
  publish('offline', { stale: result.stale })
  backoffToastShown = false

  const games = result.data.games
  // El estado anterior se actualiza solo después de comparar (06_live_ticker.md §6).
  notifyScoreChanges(previousGamesById, games)
  renderGames(panelElement, games.map(buildGameViewModel))
  previousGamesById = indexById(games)
}

function handlePollError(error) {
  publish('countdown', { secondsRemaining: 0 })
  backoffToastShown = false

  if (error.name === 'SessionExpiredError') {
    showToast('Sesión expirada: el Live Ticker se detuvo hasta reautenticarse.', { type: 'error' })
    stopped = true
    return
  }

  // Sin carga previa: no dejar el mensaje de carga colgado (Fase 8 Parte C).
  if (previousGamesById === null) {
    renderLoadFailure(panelElement)
  }

  // Error no recuperable en este ciclo: el panel no se congela, se reintenta luego.
  showToast('No se pudo actualizar el Live Ticker; se reintentará automáticamente.', {
    type: 'warning',
  })
}

async function pollOnce() {
  // Guarda de entrada: un ciclo ya agendado no se cancela solo al detener el módulo.
  if (stopped) return

  try {
    handlePollSuccess(await loadGames(handleCountdownTick))
  } catch (error) {
    handlePollError(error)
  }

  if (!stopped) {
    setTimeout(pollOnce, POLL_INTERVAL_MS)
  }
}

export function startLiveTicker() {
  panelElement = document.querySelector('section[data-module-id="live-ticker"]')

  // Reanuda el polling tras reautenticación y lo detiene ante cualquier cierre de sesión (Fase 6 Parte B).
  subscribe('session', ({ active }) => {
    if (active && stopped) {
      stopped = false
      pollOnce()
    } else if (!active) {
      stopped = true
    }
  })

  pollOnce()
}
