// Renderizado del panel de Buscador Bilingüe (09_bilingual_search.md §5): el switch existe desde el primer instante.
export function renderShell(container) {
  if (!container) return

  container.innerHTML = `
    <div class="bilingual-search">
      <button type="button" class="bilingual-search-toggle ds-button ds-button--secondary">Ver en Farsi</button>
      <input id="bilingual-search-input" type="search" class="bilingual-search-input" placeholder="Buscar equipos o estadios…" />
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

function buildListBlock({ blockClass, listClass, emptyClass, heading, items, language }) {
  const block = document.createElement('div')
  block.className = blockClass
  const headingEl = document.createElement('h3')
  headingEl.textContent = heading
  const list = document.createElement('ul')
  list.className = listClass
  for (const item of items) list.appendChild(buildEntry(item.name_en, item.name_fa, language))
  const emptyEl = document.createElement('p')
  emptyEl.className = `bilingual-search-empty ${emptyClass}`
  emptyEl.textContent = 'Sin resultados.'
  emptyEl.hidden = true
  block.append(headingEl, list, emptyEl)
  return block
}

// Primera pintura de las listas, en el idioma vigente al momento de aplicar los datos (09 §5-6).
export function renderData(container, { teams, stadiums, language }) {
  if (!container) return

  const listsEl = container.querySelector('.bilingual-search-lists')
  listsEl.innerHTML = ''

  const teamsBlock = buildListBlock({
    blockClass: 'bilingual-search-teams-block',
    listClass: 'bilingual-search-teams',
    emptyClass: 'bilingual-search-teams-empty',
    heading: 'Equipos',
    items: teams,
    language,
  })
  const stadiumsBlock = buildListBlock({
    blockClass: 'bilingual-search-stadiums-block',
    listClass: 'bilingual-search-stadiums',
    emptyClass: 'bilingual-search-stadiums-empty',
    heading: 'Estadios',
    items: stadiums,
    language,
  })

  listsEl.append(teamsBlock, stadiumsBlock)
}

// El switch recorre el DOM ya renderizado y alterna los campos, sin volver a pedir datos (09 §3.2-3.3).
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

function matchesQuery(item, query, language) {
  const value = language === 'en' ? item.dataset.nameEn : item.dataset.nameFa
  return value.toLowerCase().includes(query)
}

// Filtra una sola lista y muestra "Sin resultados." si ninguna fila quedó visible (Fase 8 Parte D).
function filterList(listEl, emptyEl, query, language) {
  let visibleCount = 0
  for (const item of listEl.children) {
    const matches = matchesQuery(item, query, language)
    item.hidden = !matches
    if (matches) visibleCount += 1
  }
  emptyEl.hidden = visibleCount > 0
}

// Filtro en tiempo real sobre el DOM ya renderizado, sin nueva petición a la API (09 §1.1).
export function applyFilter(container, query, language) {
  if (!container) return
  const teamsList = container.querySelector('.bilingual-search-teams')
  const stadiumsList = container.querySelector('.bilingual-search-stadiums')
  if (!teamsList || !stadiumsList) return

  const normalized = query.trim().toLowerCase()
  filterList(teamsList, container.querySelector('.bilingual-search-teams-empty'), normalized, language)
  filterList(stadiumsList, container.querySelector('.bilingual-search-stadiums-empty'), normalized, language)
}
