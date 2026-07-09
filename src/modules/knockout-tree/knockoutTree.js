import './knockoutTree.css'
import { loadGames, loadTeams } from '../../state/store.js'
import { publish } from '../../state/eventBus.js'
import { renderBracket, applyTeamCrossReference } from './knockoutTreeView.js'

// Árbol de Eliminatorias (10_knockout_tree.md): games/teams vía store.js
// (Fase 1) — carga de dominio real, no un ping de diagnóstico. Ambas
// cargas son independientes: teams nunca bloquea el dibujo del bracket
// con games (§5-6).
const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'third', 'final']
const ROUND_LABELS = {
  r32: 'Dieciseisavos de Final',
  r16: 'Octavos de Final',
  qf: 'Cuartos de Final',
  sf: 'Semifinal',
  third: 'Tercer Lugar',
  final: 'Final',
}

// Mismo texto base que 07_report_exporter.md, enriquecido con el
// partido/grupo de origen real que expone home_team_label/away_team_label.
const PENDING_LABEL = 'Por definir'

function handleCountdownTick(secondsRemaining) {
  publish('countdown', { secondsRemaining })
}

function translateSlotLabel(label) {
  if (!label) return null
  return label
    .replace(/^Winner Group (\w+)$/, 'Ganador del Grupo $1')
    .replace(/^Runner-up Group (\w+)$/, 'Segundo del Grupo $1')
    .replace(/^Winner Match (\d+)$/, 'Ganador del Partido $1')
    .replace(/^Loser Match (\d+)$/, 'Perdedor del Partido $1')
}

function resolveSlot(game, side) {
  const teamId = game[`${side}_team_id`]
  const embeddedName = game[`${side}_team_name_en`]
  const label = game[`${side}_team_label`]

  if (teamId === '0') {
    const translated = translateSlotLabel(label)
    return {
      text: translated ? `${PENDING_LABEL} (${translated})` : PENDING_LABEL,
      needsCrossref: false,
      teamId,
    }
  }

  if (embeddedName) {
    return { text: embeddedName, needsCrossref: false, teamId }
  }

  // Caso raro: id válido pero sin nombre embebido — necesita cruce con /get/teams.
  return { text: 'Verificando equipo…', needsCrossref: true, teamId }
}

function buildRounds(games) {
  const knockoutGames = games.filter((game) => game.type !== 'group')
  const byType = new Map()
  for (const game of knockoutGames) {
    if (!byType.has(game.type)) byType.set(game.type, [])
    byType.get(game.type).push(game)
  }

  return ROUND_ORDER.filter((type) => byType.has(type)).map((type) => {
    const roundGames = byType
      .get(type)
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((game) => ({
        id: game.id,
        home: resolveSlot(game, 'home'),
        away: resolveSlot(game, 'away'),
        scoreText: game.finished === 'TRUE' ? `${game.home_score} - ${game.away_score}` : '',
      }))
    return { type, label: ROUND_LABELS[type] ?? type, games: roundGames }
  })
}

async function runGamesLoad(panelElement, gamesPromise) {
  try {
    const result = await gamesPromise
    publish('countdown', { secondsRemaining: 0 })
    publish('offline', { stale: result.stale })
    renderBracket(panelElement, buildRounds(result.data.games))
  } catch (error) {
    publish('countdown', { secondsRemaining: 0 })
    renderBracket(panelElement, [])
  }
}

async function runTeamsLoad(panelElement, teamsPromise) {
  try {
    const result = await teamsPromise
    const teamsById = new Map(result.data.teams.map((team) => [team.id, team]))
    applyTeamCrossReference(panelElement, { teamsById, failed: false })
  } catch (error) {
    applyTeamCrossReference(panelElement, { teamsById: null, failed: true })
  }
}

export function startKnockoutTree() {
  const panelElement = document.querySelector('section[data-module-id="knockout-tree"]')

  const gamesPromise = loadGames(handleCountdownTick)
  const teamsPromise = loadTeams(handleCountdownTick)

  runGamesLoad(panelElement, gamesPromise)
  runTeamsLoad(panelElement, teamsPromise)
}
