// Envoltorio de timeout con AbortController (05_shared_infrastructure.md §7).
// Utilidad genérica e independiente: cada módulo que la use define su
// propio tiempo límite; esta pieza no decide qué hacer con el resultado.
export async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}
