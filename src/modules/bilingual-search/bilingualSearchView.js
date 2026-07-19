// Renderizado del panel de Buscador Bilingüe. El switch existe desde el
// primer instante (incluso durante la carga) para que clickearlo antes
// de que lleguen los datos nunca rompa nada (09_bilingual_search.md §5).
export function renderShell(container) {
  if (!container) return

  container.innerHTML = `
    <div class="bilingual-search">
      <button type="button" class="bilingual-search-toggle ds-button ds-button--secondary">Ver en Farsi</button>
      <div class="bilingual-search-lists">
        <p class="bilingual-search-loading">Cargando equipos y estadios…</p>
      </div>
    </div>
  `
}

function buildEntry(nameEn, nameFa, language) {
  const li = document.createElement('li')
  li.dataset.nameEn = nameEn
  li.dataset.nameFa = nameFa
  li.textContent = language === 'en' ? nameEn : nameFa
  return li
}

// Primera pintura de las listas, ya en el idioma vigente en ese momento
// (09 §5-6: se lee al aplicar los datos, no al solicitarlos).
export function renderData(container, { teams, stadiums, language }) {
  if (!container) return

  const listsEl = container.querySelector('.bilingual-search-lists')
  listsEl.innerHTML = ''

  const teamsBlock = document.createElement('div')
  teamsBlock.className = 'bilingual-search-teams-block'
  const teamsHeading = document.createElement('h3')
  teamsHeading.textContent = 'Equipos'
  const teamsList = document.createElement('ul')
  teamsList.className = 'bilingual-search-teams'
  for (const team of teams) teamsList.appendChild(buildEntry(team.name_en, team.name_fa, language))
  teamsBlock.append(teamsHeading, teamsList)

  const stadiumsBlock = document.createElement('div')
  stadiumsBlock.className = 'bilingual-search-stadiums-block'
  const stadiumsHeading = document.createElement('h3')
  stadiumsHeading.textContent = 'Estadios'
  const stadiumsList = document.createElement('ul')
  stadiumsList.className = 'bilingual-search-stadiums'
  for (const stadium of stadiums)
    stadiumsList.appendChild(buildEntry(stadium.name_en, stadium.name_fa, language))
  stadiumsBlock.append(stadiumsHeading, stadiumsList)

  listsEl.append(teamsBlock, stadiumsBlock)
}

// El switch: recorre el DOM ya renderizado y alterna los campos, sin
// volver a pedir datos (09 §3.2-3.3).
export function applyLanguage(container, language) {
  if (!container) return
  const items = container.querySelectorAll('[data-name-en]')
  for (const item of items) {
    item.textContent = language === 'en' ? item.dataset.nameEn : item.dataset.nameFa
  }
}

export function updateToggleLabel(container, language) {
  if (!container) return
  const button = container.querySelector('.bilingual-search-toggle')
  if (!button) return
  button.textContent = language === 'en' ? 'Ver en Farsi' : 'View in English'
}
