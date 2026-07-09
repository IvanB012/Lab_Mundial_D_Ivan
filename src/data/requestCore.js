import { BASE_URL } from './endpoints.js'
import { retryWithBackoff } from './backoff.js'
import { saveResponse, getCachedResponse } from './cache.js'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

// Primitivo de red más bajo: no conoce tokens (evita una dependencia
// circular con auth.js). Aplica backoff (03_business_rules.md §4) y,
// ante fallo final, recuperación desde caché (03_business_rules.md §5).
export async function coreRequest(
  path,
  { method = 'GET', headers = {}, body, cacheKey, onCountdownTick, baseUrl = BASE_URL } = {},
) {
  const executeAttempt = async () =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

  let response
  try {
    response = await retryWithBackoff(executeAttempt, { onCountdownTick })
  } catch (networkError) {
    const cached = cacheKey ? getCachedResponse(cacheKey) : null
    if (cached) {
      return { data: cached.data, stale: true, cachedAt: cached.cachedAt }
    }
    throw networkError
  }

  if (response.ok) {
    const data = await response.json()
    if (cacheKey) saveResponse(cacheKey, data)
    return { data, stale: false }
  }

  // El 401 nunca se sirve desde caché: significa que la sesión expiró,
  // no que la red falló, así que no tiene sentido fingir datos vigentes.
  if (response.status !== 401 && cacheKey) {
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return { data: cached.data, stale: true, cachedAt: cached.cachedAt }
    }
  }

  throw new HttpError(response.status, `Request to ${path} failed with status ${response.status}`)
}
