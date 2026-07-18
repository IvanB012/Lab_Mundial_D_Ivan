// Renderizado del panel de Live Ticker. Fase 4: el equipo local/visitante
// se separa en su propio <span data-team-id> (mismo patrón que el Bracket
// en knockoutTreeView.js) para que el CSS pueda pintar como badge los
// equipos aún no determinados (data-team-id="0"), sin decidir aquí cuál
// texto mostrar — eso ya lo resolvió liveTicker.js.
export function renderGames(container, games) {
  if (!container) return

  container.innerHTML = `
    <ul class="live-ticker-list">
      ${games
        .map(
          (game) => `
        <li data-game-id="${game.id}">
          <span class="live-ticker-team" data-team-id="${game.home_team_id}">${game.homeLabel}</span>
          <span class="live-ticker-score">${game.scoreText}</span>
          <span class="live-ticker-team" data-team-id="${game.away_team_id}">${game.awayLabel}</span>
          <span class="live-ticker-time">${game.time_elapsed}</span>
        </li>
      `,
        )
        .join('')}
    </ul>
  `
}
