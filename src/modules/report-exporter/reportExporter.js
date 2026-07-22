import './reportExporter.css'
import { loadGames, loadTeams, loadStadiums } from '../../state/store.js'
import { publish } from '../../state/eventBus.js'
import { renderReport } from './reportExporterView.js'

// Exportador de Reportes (07_report_exporter.md): cruza games/teams/stadiums vía store.js.
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

// Mismo texto que knockoutTree.js, para consistencia entre módulos.
const PENDING_LABEL = 'Por definir'

function hasValue(value) {
  return value !== undefined && value !== null && value !== 'null' && value !== ''
}

function buildStadiumText(stadiumsById, stadium) {
  if (!stadiumsById) return 'No disponible (Estadios no cargó)'
  return stadium ? `${stadium.name_en}, ${stadium.city_en}` : 'No disponible'
}

function buildTeamCodesText(teamsById, homeTeam, awayTeam) {
  if (!teamsById) return 'No disponible (Equipos no cargó)'
  return `${homeTeam?.fifa_code ?? '?'} - ${awayTeam?.fifa_code ?? '?'}`
}

function buildReportRow(game, teamsById, stadiumsById) {
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
    stadiumText: buildStadiumText(stadiumsById, stadium),
    teamCodesText: buildTeamCodesText(teamsById, homeTeam, awayTeam),
  }
}

function buildReportRows(games, teamsById, stadiumsById) {
  return games.map((game) => buildReportRow(game, teamsById, stadiumsById))
}

async function fetchAllResources() {
  const [gamesResult, teamsResult, stadiumsResult] = await Promise.allSettled([
    loadGames(handleCountdownTick),
    loadTeams(handleCountdownTick),
    loadStadiums(handleCountdownTick),
  ])
  publish('countdown', { secondsRemaining: 0 })
  return { games: gamesResult, teams: teamsResult, stadiums: stadiumsResult }
}

function summarizeResults(results) {
  const anyStale = Object.values(results).some(
    (result) => result.status === 'fulfilled' && result.value.stale,
  )
  publish('offline', { stale: anyStale })

  const missingResources = Object.entries(results)
    .filter(([, result]) => result.status === 'rejected')
    .map(([key]) => RESOURCE_LABELS[key])

  const teamsById =
    results.teams.status === 'fulfilled' ? indexById(results.teams.value.data.teams) : null
  const stadiumsById =
    results.stadiums.status === 'fulfilled' ? indexById(results.stadiums.value.data.stadiums) : null

  const rows =
    results.games.status === 'fulfilled'
      ? buildReportRows(results.games.value.data.games, teamsById, stadiumsById)
      : null

  return { rows, missingResources }
}

async function loadReportData() {
  return summarizeResults(await fetchAllResources())
}

export async function startReportExporter() {
  const panelElement = document.querySelector('section[data-module-id="report-exporter"]')
  const reportData = await loadReportData()
  renderReport(panelElement, reportData)
}
