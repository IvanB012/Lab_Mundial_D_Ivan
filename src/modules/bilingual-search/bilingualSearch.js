import './bilingualSearch.css'
import { loadTeams, loadStadiums } from '../../state/store.js'
import { publish } from '../../state/eventBus.js'
import {
  renderShell,
  renderData,
  applyLanguage,
  updateToggleLabel,
  applyFilter,
} from './bilingualSearchView.js'

// Buscador Bilingüe (09_bilingual_search.md): carga teams/stadiums una sola vez vía store.js.
let currentLanguage = 'en'
let searchQuery = ''

function handleCountdownTick(secondsRemaining) {
  publish('countdown', { secondsRemaining })
}

async function loadBilingualData() {
  const [teamsResult, stadiumsResult] = await Promise.allSettled([
    loadTeams(handleCountdownTick),
    loadStadiums(handleCountdownTick),
  ])
  publish('countdown', { secondsRemaining: 0 })

  const anyStale = [teamsResult, stadiumsResult].some(
    (result) => result.status === 'fulfilled' && result.value.stale,
  )
  publish('offline', { stale: anyStale })

  return {
    teams: teamsResult.status === 'fulfilled' ? teamsResult.value.data.teams : [],
    stadiums: stadiumsResult.status === 'fulfilled' ? stadiumsResult.value.data.stadiums : [],
  }
}

// No-op si todavía no hay filas: nunca rompe ni muestra undefined (09 §5).
function wireLanguageToggle(panelElement) {
  const toggleButton = panelElement.querySelector('.bilingual-search-toggle')
  toggleButton.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'fa' : 'en'
    updateToggleLabel(panelElement, currentLanguage)
    applyLanguage(panelElement, currentLanguage)
    applyFilter(panelElement, searchQuery, currentLanguage)
  })
}

function wireSearchInput(panelElement) {
  const searchInput = panelElement.querySelector('.bilingual-search-input')
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value
    applyFilter(panelElement, searchQuery, currentLanguage)
  })
}

export async function startBilingualSearch() {
  const panelElement = document.querySelector('section[data-module-id="bilingual-search"]')
  renderShell(panelElement)
  wireLanguageToggle(panelElement)
  wireSearchInput(panelElement)

  const { teams, stadiums } = await loadBilingualData()

  // currentLanguage y searchQuery se leen al llegar los datos, no al iniciar la petición (09 §5-6).
  renderData(panelElement, { teams, stadiums, language: currentLanguage })
  applyFilter(panelElement, searchQuery, currentLanguage)
}
