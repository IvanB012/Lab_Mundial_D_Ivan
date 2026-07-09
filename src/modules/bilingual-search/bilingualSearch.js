import { loadTeams, loadStadiums } from '../../state/store.js'
import { publish } from '../../state/eventBus.js'
import { renderShell, renderData, applyLanguage, updateToggleLabel } from './bilingualSearchView.js'

// Buscador Bilingüe (09_bilingual_search.md): carga teams/stadiums una
// sola vez vía store.js (Fase 1, Capa de Estado) — este SÍ es dominio
// real, a diferencia del ping de diagnóstico de Monitor de Integridad.
let currentLanguage = 'en'

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

export async function startBilingualSearch() {
  const panelElement = document.querySelector('section[data-module-id="bilingual-search"]')
  renderShell(panelElement)

  const toggleButton = panelElement.querySelector('.bilingual-search-toggle')
  toggleButton.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'fa' : 'en'
    updateToggleLabel(panelElement, currentLanguage)
    // No-op si todavía no hay filas (solo el placeholder "Cargando…") —
    // nunca rompe ni muestra undefined (09 §5).
    applyLanguage(panelElement, currentLanguage)
  })

  const { teams, stadiums } = await loadBilingualData()

  // currentLanguage se lee AHORA, en el momento en que los datos llegan
  // — no el valor que estaba activo cuando se inició la petición (09 §5-6).
  renderData(panelElement, { teams, stadiums, language: currentLanguage })
}
