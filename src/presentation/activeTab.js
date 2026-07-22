const STORAGE_KEY = 'wc26_active_tab'

// Fase 8 Parte E: valor obsoleto/inválido cae en la primera pestaña (dashboard_design.md §5).
export function getStoredActiveTab(validIds) {
  const stored = localStorage.getItem(STORAGE_KEY)
  return validIds.includes(stored) ? stored : validIds[0]
}

export function setStoredActiveTab(moduleId) {
  localStorage.setItem(STORAGE_KEY, moduleId)
}
