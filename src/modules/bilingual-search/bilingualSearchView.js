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

// Primera pintura de las listas, ya en el idioma vigente en ese momento
// (09 §5-6: se lee al aplicar los datos, no al solicitarlos).
export function renderData(container, { teams, stadiums, language }) {
  if (!container) return

  const listsEl = container.querySelector('.bilingual-search-lists')

  const teamItems = teams
    .map(
      (team) => `
      <li data-name-en="${team.name_en}" data-name-fa="${team.name_fa}">
        ${language === 'en' ? team.name_en : team.name_fa}
      </li>
    `,
    )
    .join('')

  const stadiumItems = stadiums
    .map(
      (stadium) => `
      <li data-name-en="${stadium.name_en}" data-name-fa="${stadium.name_fa}">
        ${language === 'en' ? stadium.name_en : stadium.name_fa}
      </li>
    `,
    )
    .join('')

  listsEl.innerHTML = `
    <div class="bilingual-search-teams-block">
      <h3>Equipos</h3>
      <ul class="bilingual-search-teams">${teamItems}</ul>
    </div>
    <div class="bilingual-search-stadiums-block">
      <h3>Estadios</h3>
      <ul class="bilingual-search-stadiums">${stadiumItems}</ul>
    </div>
  `
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
