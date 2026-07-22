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

// Primitivo de red más bajo (no conoce tokens, 03_business_rules.md §4-5).
function serveCachedFallback(cacheKey) {
  const cached = cacheKey ? getCachedResponse(cacheKey) : null
  return cached ? { data: cached.data, stale: true, cachedAt: cached.cachedAt } : null
}

async function runWithBackoff(baseUrl, path, method, headers, body, onCountdownTick) {
  const executeAttempt = async () =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  return retryWithBackoff(executeAttempt, { onCountdownTick })
}

// El 401 nunca se sirve desde caché: es sesión vencida, no fallo de red.
async function resolveResponse(response, path, cacheKey) {
  if (response.ok) {
    const data = await response.json()
    if (cacheKey) saveResponse(cacheKey, data)
    return { data, stale: false }
  }
  const fallback = response.status !== 401 ? serveCachedFallback(cacheKey) : null
  if (fallback) return fallback
  throw new HttpError(response.status, `Request to ${path} failed with status ${response.status}`)
}

export async function coreRequest(
  path,
  { method = 'GET', headers = {}, body, cacheKey, onCountdownTick, baseUrl = BASE_URL } = {},
) {
  let response
  try {
    response = await runWithBackoff(baseUrl, path, method, headers, body, onCountdownTick)
  } catch (networkError) {
    const fallback = serveCachedFallback(cacheKey)
    if (fallback) return fallback
    throw networkError
  }
  return resolveResponse(response, path, cacheKey)
}
