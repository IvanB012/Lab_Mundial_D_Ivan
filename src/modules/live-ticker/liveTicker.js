import './liveTicker.css'
import { loadGames } from '../../state/store.js'
import { publish, subscribe } from '../../state/eventBus.js'
import { showToast } from '../../presentation/toast.js'
import { renderGames } from './liveTickerView.js'

// Live Ticker (06_live_ticker.md): polling con backoff exponencial sobre
// GET /get/games, comparación de marcadores y notificaciones no bloqueantes.
// Solo publica 'countdown' y 'offline' — 'session' es una responsabilidad
// transversal fuera del dominio de este módulo, pero sí la escucha para
// saber cuándo reanudar el polling tras una detención por sesión expirada.
const POLL_INTERVAL_MS = 15000

// Mismo texto y enriquecimiento que 10_knockout_tree.md §5 (Ganador/Perdedor
// de Partido, Ganador/Segundo de Grupo), para que los módulos que muestran
// equipos de fase eliminatoria aún no determinados sean consistentes entre sí.
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

async function pollOnce() {
  // Guarda de entrada: un ciclo puede quedar agendado con setTimeout()
  // antes de que 'session':{active:false} ponga stopped en true (401 real
  // o logout manual). El chequeo de abajo, antes de agendar el SIGUIENTE
  // ciclo, no cancela ese timer ya pendiente — sin esta guarda, ese ciclo
  // ya agendado igual dispararía una petición de red tras el logout.
  if (stopped) return

  try {
    const result = await loadGames(handleCountdownTick)
    publish('countdown', { secondsRemaining: 0 })
    publish('offline', { stale: result.stale })
    backoffToastShown = false

    const games = result.data.games
    // El estado anterior se actualiza solo después de comparar, para no
    // perder la referencia del siguiente ciclo (06_live_ticker.md §6).
    notifyScoreChanges(previousGamesById, games)
    renderGames(
      panelElement,
      games.map((game) => ({
        ...game,
        homeLabel: resolveTeamLabel(game, 'home'),
        awayLabel: resolveTeamLabel(game, 'away'),
        // Un partido no iniciado (finished !== 'TRUE') no tiene marcador
        // real todavía: mostrar "0 - 0" tal cual lo confundiría con un
        // resultado real. Mismo patrón que buildRounds() en
        // knockoutTree.js.
        scoreText: game.finished === 'TRUE' ? `${game.home_score} - ${game.away_score}` : 'vs',
      })),
    )
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

  // Reanuda el polling tras una reautenticación exitosa, pero solo si
  // este módulo llegó a detenerse antes (stopped === true). El primer
  // publish('session', {active:true}) del login inicial ocurre antes de
  // que esta suscripción exista (login.js llama a onFirstSuccess después
  // de publicar), así que no hay riesgo de arrancar el polling dos veces.
  //
  // Rama simétrica (ROADMAP.md Fase 6, Parte B): antes, `stopped` solo se
  // ponía en true dentro del propio catch de pollOnce() al recibir un
  // SessionExpiredError real. Un cierre de sesión manual (logoutButton.js)
  // publica el mismo 'session':{active:false} sin pasar por ese catch, así
  // que sin esta rama el polling seguiría corriendo tras un logout manual.
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
