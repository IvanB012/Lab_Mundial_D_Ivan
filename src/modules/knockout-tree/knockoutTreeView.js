// Renderizado del bracket. El dibujo inicial usa games (embebido o
// "Por definir"); applyTeamCrossReference() parchea solo las casillas
// que quedaron pendientes de cruce con /get/teams, sin tocar el resto
// (10_knockout_tree.md §5).
export function renderBracket(container, rounds) {
  if (!container) return

  if (rounds.length === 0) {
    container.innerHTML = `<p class="knockout-tree-empty">No hay partidos de fase eliminatoria disponibles.</p>`
    return
  }

  container.innerHTML = `
    <div class="knockout-tree">
      ${rounds
        .map(
          (round) => `
        <div class="knockout-round" data-round-type="${round.type}">
          <h3>${round.label}</h3>
          ${round.games
            .map(
              (game) => `
            <div class="knockout-match" data-game-id="${game.id}">
              <div
                class="knockout-team"
                data-side="home"
                data-team-id="${game.home.teamId}"
                ${game.home.needsCrossref ? 'data-needs-crossref="true"' : ''}
              >${game.home.text}</div>
              ${game.scoreText ? `<div class="knockout-score">${game.scoreText}</div>` : ''}
              <div
                class="knockout-team"
                data-side="away"
                data-team-id="${game.away.teamId}"
                ${game.away.needsCrossref ? 'data-needs-crossref="true"' : ''}
              >${game.away.text}</div>
            </div>
          `,
            )
            .join('')}
        </div>
      `,
        )
        .join('')}
    </div>
  `
}

export function applyTeamCrossReference(container, { teamsById, failed }) {
  if (!container) return
  const pendingSlots = container.querySelectorAll('[data-needs-crossref="true"]')
  for (const slot of pendingSlots) {
    if (failed) {
      slot.textContent = 'Error al cruzar equipo'
    } else {
      const team = teamsById.get(slot.dataset.teamId)
      slot.textContent = team ? team.name_en : 'Error al cruzar equipo'
    }
    slot.removeAttribute('data-needs-crossref')
  }
}
