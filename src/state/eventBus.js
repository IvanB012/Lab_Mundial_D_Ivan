const listeners = new Map()

// Sistema de Eventos (05_shared_infrastructure.md §4): pub/sub interno
// sin lógica de negocio, usado por el Gestor de Estado Global.
export function subscribe(topic, callback) {
  if (!listeners.has(topic)) listeners.set(topic, new Set())
  listeners.get(topic).add(callback)
  return () => unsubscribe(topic, callback)
}

export function unsubscribe(topic, callback) {
  const topicListeners = listeners.get(topic)
  if (topicListeners) topicListeners.delete(callback)
}

export function publish(topic, payload) {
  const topicListeners = listeners.get(topic)
  if (!topicListeners) return
  for (const callback of topicListeners) callback(payload)
}
