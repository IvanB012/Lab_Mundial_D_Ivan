import './reportExporter.css'
import { loadGames, loadTeams, loadStadiums } from '../../state/store.js'
import { publish } from '../../state/eventBus.js'
import { renderReport } from './reportExporterView.js'

// Exportador de Reportes (07_report_exporter.md): cruza games/teams/
// stadiums vía store.js (Fase 1), sin acceder a src/data/ directamente.
const RESOURCE_LABELS = {
  games: 'Partidos',
  teams: 'Equipos',
  stadiums: 'Estadios',
}

function handleCountdownTick(secondsRemaining) {
  publish('countdown', { secondsRemaining })
}

function indexById(list) {
  const map = new Map()
  for (const item of list) map.set(item.id, item)
  return map
}

// Partidos de fase eliminatoria aún no determinados (dependen de un
// resultado previo) no traen equipo/marcador real todavía. Mismo texto
// que 10_knockout_tree.md §5, para que ambos módulos sean consistentes.
const PENDING_LABEL = 'Por definir'

function hasValue(value) {
  return value !== undefined && value !== null && value !== 'null' && value !== ''
}

function buildReportRows(games, teamsById, stadiumsById) {
  return games.map((game) => {
    const homeTeam = teamsById?.get(game.home_team_id)
    const awayTeam = teamsById?.get(game.away_team_id)
    const stadium = stadiumsById?.get(game.stadium_id)

    const matchup =
      hasValue(game.home_team_name_en) && hasValue(game.away_team_name_en)
        ? `${game.home_team_name_en} vs ${game.away_team_name_en}`
        : PENDING_LABEL

    const score =
      hasValue(game.home_score) && hasValue(game.away_score)
        ? `${game.home_score} - ${game.away_score}`
        : PENDING_LABEL

    return {
      id: game.id,
      matchup,
      score,
      date: game.local_date,
      stadiumText: !stadiumsById
        ? 'No disponible (Estadios no cargó)'
        : stadium
          ? `${stadium.name_en}, ${stadium.city_en}`
          : 'No disponible',
      teamCodesText: !teamsById
        ? 'No disponible (Equipos no cargó)'
        : `${homeTeam?.fifa_code ?? '?'} - ${awayTeam?.fifa_code ?? '?'}`,
    }
  })
}

async function loadReportData() {
  const [gamesResult, teamsResult, stadiumsResult] = await Promise.allSettled([
    loadGames(handleCountdownTick),
    loadTeams(handleCountdownTick),
    loadStadiums(handleCountdownTick),
  ])
  publish('countdown', { secondsRemaining: 0 })

  const results = { games: gamesResult, teams: teamsResult, stadiums: stadiumsResult }
  const anyStale = Object.values(results).some(
    (result) => result.status === 'fulfilled' && result.value.stale,
  )
  publish('offline', { stale: anyStale })

  const missingResources = Object.entries(results)
    .filter(([, result]) => result.status === 'rejected')
    .map(([key]) => RESOURCE_LABELS[key])

  const teamsById =
    teamsResult.status === 'fulfilled' ? indexById(teamsResult.value.data.teams) : null
  const stadiumsById =
    stadiumsResult.status === 'fulfilled' ? indexById(stadiumsResult.value.data.stadiums) : null

  const rows =
    gamesResult.status === 'fulfilled'
      ? buildReportRows(gamesResult.value.data.games, teamsById, stadiumsById)
      : null

  return { rows, missingResources }
}

export async function startReportExporter() {
  const panelElement = document.querySelector('section[data-module-id="report-exporter"]')
  const reportData = await loadReportData()
  renderReport(panelElement, reportData)
}
