// Renderizado del panel de Live Ticker — solo estructura, sin colores
// ni tipografía todavía (eso llega en Fase 4).
export function renderGames(container, games) {
  if (!container) return

  container.innerHTML = `
    <ul class="live-ticker-list">
      ${games
        .map(
          (game) => `
        <li data-game-id="${game.id}">
          <span>${game.home_team_name_en} ${game.home_score} - ${game.away_score} ${game.away_team_name_en}</span>
          <span>${game.time_elapsed}</span>
        </li>
      `,
        )
        .join('')}
    </ul>
  `
}
