// Renderizado del panel de Live Ticker. Fase 4: el equipo local/visitante
// se separa en su propio <span data-team-id> (mismo patrón que el Bracket
// en knockoutTreeView.js) para que el CSS pueda pintar como badge los
// equipos aún no determinados (data-team-id="0"), sin decidir aquí cuál
// texto mostrar — eso ya lo resolvió liveTicker.js.
function buildTeamSpan(teamId, label) {
  const span = document.createElement('span')
  span.className = 'live-ticker-team'
  span.dataset.teamId = teamId
  span.textContent = label
  return span
}

export function renderGames(container, games) {
  if (!container) return

  const list = document.createElement('ul')
  list.className = 'live-ticker-list'

  for (const game of games) {
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
    list.appendChild(li)
  }

  container.innerHTML = ''
  container.appendChild(list)
}
