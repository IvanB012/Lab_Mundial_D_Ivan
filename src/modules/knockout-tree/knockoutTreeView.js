// Renderizado del bracket. El dibujo inicial usa games (embebido o
// "Por definir"); applyTeamCrossReference() parchea solo las casillas
// que quedaron pendientes de cruce con /get/teams, sin tocar el resto
// (10_knockout_tree.md §5).
function buildTeamSlot(side, slot) {
  const div = document.createElement('div')
  div.className = 'knockout-team'
  div.dataset.side = side
  div.dataset.teamId = slot.teamId
  if (slot.needsCrossref) div.dataset.needsCrossref = 'true'
  div.textContent = slot.text
  return div
}

function buildMatch(game) {
  const match = document.createElement('div')
  match.className = 'knockout-match'
  match.dataset.gameId = game.id

  match.appendChild(buildTeamSlot('home', game.home))
  if (game.scoreText) {
    const score = document.createElement('div')
    score.className = 'knockout-score'
    score.textContent = game.scoreText
    match.appendChild(score)
  }
  match.appendChild(buildTeamSlot('away', game.away))

  return match
}

export function renderBracket(container, rounds) {
  if (!container) return

  container.innerHTML = ''

  if (rounds.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'knockout-tree-empty'
    empty.textContent = 'No hay partidos de fase eliminatoria disponibles.'
    container.appendChild(empty)
    return
  }

  const tree = document.createElement('div')
  tree.className = 'knockout-tree'

  for (const round of rounds) {
    const roundDiv = document.createElement('div')
    roundDiv.className = 'knockout-round'
    roundDiv.dataset.roundType = round.type

    const heading = document.createElement('h3')
    heading.textContent = round.label
    roundDiv.appendChild(heading)

    for (const game of round.games) {
      roundDiv.appendChild(buildMatch(game))
    }

    tree.appendChild(roundDiv)
  }

  container.appendChild(tree)
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
