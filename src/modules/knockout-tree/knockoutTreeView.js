// Renderizado del bracket (10_knockout_tree.md §5); applyTeamCrossReference() parchea aparte.
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

function buildEmptyMessage() {
  const empty = document.createElement('p')
  empty.className = 'knockout-tree-empty'
  empty.textContent = 'No hay partidos de fase eliminatoria disponibles.'
  return empty
}

function buildRound(round) {
  const roundDiv = document.createElement('div')
  roundDiv.className = 'knockout-round'
  roundDiv.dataset.roundType = round.type

  const heading = document.createElement('h3')
  heading.textContent = round.label
  roundDiv.appendChild(heading)

  for (const game of round.games) {
    roundDiv.appendChild(buildMatch(game))
  }

  return roundDiv
}

export function renderBracket(container, rounds) {
  if (!container) return

  container.innerHTML = ''

  if (rounds.length === 0) {
    container.appendChild(buildEmptyMessage())
    return
  }

  const tree = document.createElement('div')
  tree.className = 'knockout-tree'
  for (const round of rounds) tree.appendChild(buildRound(round))

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
