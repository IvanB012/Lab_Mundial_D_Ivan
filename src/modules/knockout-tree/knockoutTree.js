import './knockoutTree.css'
import { loadGames, loadTeams } from '../../state/store.js'
import { publish } from '../../state/eventBus.js'
import { renderBracket, applyTeamCrossReference } from './knockoutTreeView.js'

// Árbol de Eliminatorias (10_knockout_tree.md §5-6): games/teams cargan en paralelo e independientes.
const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'third', 'final']
const ROUND_LABELS = {
  r32: 'Dieciseisavos de Final',
  r16: 'Octavos de Final',
  qf: 'Cuartos de Final',
  sf: 'Semifinal',
  third: 'Tercer Lugar',
  final: 'Final',
}

// Mismo texto base que reportExporter.js, enriquecido con el origen real del cruce pendiente.
const PENDING_LABEL = 'Por definir'

function handleCountdownTick(secondsRemaining) {
  publish('countdown', { secondsRemaining })
}

// Desacoplan "¿ya tengo teams?" de "¿ya puedo aplicarlo?" sin importar quién resuelva primero.
let bracketRendered = false
let teamsOutcome = null
let crossReferenceApplied = false

// Idempotente: la primera llamada (desde runGamesLoad o runTeamsLoad) que cumpla ambas condiciones aplica el parche.
function tryApplyCrossReference(panelElement) {
  if (crossReferenceApplied || !bracketRendered || teamsOutcome === null) return
  crossReferenceApplied = true
  applyTeamCrossReference(panelElement, teamsOutcome)
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

function buildResolvedRound(type, byType) {
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
}

// Sin datos reales todavía para esta ronda (10 §5): una casilla "Por definir", nunca la ronda entera vacía.
function buildPlaceholderSlot() {
  return { text: PENDING_LABEL, needsCrossref: false, teamId: '' }
}

function buildPlaceholderRound(type) {
  const placeholderGame = {
    id: `placeholder-${type}`,
    home: buildPlaceholderSlot(),
    away: buildPlaceholderSlot(),
    scoreText: '',
  }
  return { type, label: ROUND_LABELS[type] ?? type, games: [placeholderGame] }
}

// Las 6 rondas siempre existen (estructura fija del bracket, no depende de la API): con o sin partidos reales.
function buildRounds(games) {
  const knockoutGames = games.filter((game) => game.type !== 'group')
  const byType = new Map()
  for (const game of knockoutGames) {
    if (!byType.has(game.type)) byType.set(game.type, [])
    byType.get(game.type).push(game)
  }

  return ROUND_ORDER.map((type) => (byType.has(type) ? buildResolvedRound(type, byType) : buildPlaceholderRound(type)))
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
  bracketRendered = true
  tryApplyCrossReference(panelElement)
}

async function runTeamsLoad(panelElement, teamsPromise) {
  try {
    const result = await teamsPromise
    const teamsById = new Map(result.data.teams.map((team) => [team.id, team]))
    teamsOutcome = { teamsById, failed: false }
  } catch (error) {
    teamsOutcome = { teamsById: null, failed: true }
  }
  tryApplyCrossReference(panelElement)
}

export function startKnockoutTree() {
  const panelElement = document.querySelector('section[data-module-id="knockout-tree"]')

  const gamesPromise = loadGames(handleCountdownTick)
  const teamsPromise = loadTeams(handleCountdownTick)

  runGamesLoad(panelElement, gamesPromise)
  runTeamsLoad(panelElement, teamsPromise)
}
