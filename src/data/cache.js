const CACHE_PREFIX = 'wc26_cache:'

// Gestor de Caché: última respuesta exitosa por endpoint, para modo offline (03_business_rules.md §5).
export function saveResponse(key, data) {
  const entry = { data, cachedAt: Date.now() }
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
}

export function getCachedResponse(key) {
  const raw = localStorage.getItem(CACHE_PREFIX + key)
  if (!raw) return null
  return JSON.parse(raw)
}

// Cierre de sesión: borra la caché para que la próxima sesión no arranque en modo offline.
export function clearCache() {
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i)
    if (key && key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key)
  }
}
