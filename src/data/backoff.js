const RETRYABLE_STATUSES = [429, 500]
const DELAYS_MS = [1000, 2000, 4000, 8000]

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitWithCountdown(ms, onCountdownTick) {
  let remainingSeconds = Math.ceil(ms / 1000)
  while (remainingSeconds > 0) {
    if (onCountdownTick) onCountdownTick(remainingSeconds)
    await wait(1000)
    remainingSeconds -= 1
  }
}

// Reintenta con espera creciente ante 429/500 (03_business_rules.md §4); countdown solo en 429.
export async function retryWithBackoff(executeAttempt, { onCountdownTick } = {}) {
  let lastResponse

  for (let attempt = 0; attempt <= DELAYS_MS.length; attempt += 1) {
    const response = await executeAttempt()

    if (!RETRYABLE_STATUSES.includes(response.status)) {
      return response
    }

    lastResponse = response
    const isLastAttempt = attempt === DELAYS_MS.length
    if (isLastAttempt) break

    const delayMs = DELAYS_MS[attempt]
    if (response.status === 429) {
      await waitWithCountdown(delayMs, onCountdownTick)
    } else {
      await wait(delayMs)
    }
  }

  return lastResponse
}
