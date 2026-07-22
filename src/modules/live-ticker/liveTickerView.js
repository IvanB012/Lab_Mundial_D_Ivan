// Renderizado del panel de Live Ticker (mismo patrón data-team-id que knockoutTreeView.js).
function buildTeamSpan(teamId, label) {
  const span = document.createElement('span')
  span.className = 'live-ticker-team'
  span.dataset.teamId = teamId
  span.textContent = label
  return span
}

function buildGameItem(game) {
  const li = document.createElement('li')
  li.dataset.gameId = game.id

  const scoreSpan = document.createElement('span')
  scoreSpan.className = 'live-ticker-score'
  scoreSpan.textContent = game.scoreText

  const timeSpan = document.createElement('span')
  timeSpan.className = 'live-ticker-time'
  timeSpan.textContent = game.time_elapsed

  li.append(
    buildTeamSpan(game.home_team_id, game.homeLabel),
    scoreSpan,
    buildTeamSpan(game.away_team_id, game.awayLabel),
    timeSpan,
  )
  return li
}

export function renderGames(container, games) {
  if (!container) return

  const list = document.createElement('ul')
  list.className = 'live-ticker-list'
  for (const game of games) list.appendChild(buildGameItem(game))

  container.innerHTML = ''
  container.appendChild(list)
}

// Fase 8 Parte C: estado persistente cuando nunca hubo una carga exitosa, en vez de dejar el texto de carga colgado.
export function renderLoadFailure(container) {
  if (!container) return
  const message = document.createElement('p')
  message.className = 'live-ticker-load-error'
  message.textContent = 'No se pudieron cargar los partidos. Reintentando automáticamente…'
  container.innerHTML = ''
  container.appendChild(message)
}
