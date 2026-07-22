# 05_shared_infrastructure.md

## Encabezado

**Propósito:** Enumerar los componentes reutilizables que existen antes de construir cualquier módulo.

**Responsabilidad:** ¿Qué componentes reutilizables existen antes de construir cualquier módulo?

**Tipo:** Estático — el inventario de piezas compartidas no cambia salvo que aparezca una necesidad real de una nueva pieza transversal durante la implementación.

**Prioridad:** 5 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
02_architecture.md
03_business_rules.md
04_api_contract.md

Necesario para conocer:
- las capas que estas piezas implementan
- las reglas de resiliencia que estas piezas deben cumplir
- la forma de la API que el cliente HTTP consume
```

**Alcance:** Inventario de piezas reutilizables, cada una descrita de forma aislada. No describe cómo se relacionan entre capas (eso es `02_architecture.md`) ni las reglas que cada pieza debe cumplir (eso es `03_business_rules.md`, esta pieza solo las implementa).

**Criterio de separación con `02_architecture.md`:** este documento describe **qué existe y para qué sirve cada pieza por sí sola**. Si una frase describe una relación o dirección de flujo entre piezas, no pertenece aquí — pertenece a `02_architecture.md`.

---

## 1. Cliente HTTP

Responsable de ejecutar las llamadas `fetch` hacia los endpoints descritos en `04_api_contract.md`, aplicando el encabezado de autenticación y las reglas de reintento y backoff definidas en `03_business_rules.md`. Es la única pieza autorizada a construir y enviar peticiones de red.

**Nota de duplicación conocida (`00_assistant_contract.md §1`, Single Source of Truth):** `checkEndpointHealth()` (Monitor de Integridad, en `store.js`) es una excepción ya documentada a esta exclusividad — arma su propio `fetch` sobre el envoltorio de `AbortController` (sección 7 de este documento) en vez de pasar por el Cliente HTTP, para no acoplar el timeout de 5s del módulo al backoff del Cliente HTTP. Desde la fase de refuerzo de seguridad (`ROADMAP.md`), esa función también reimplementa por su cuenta el criterio "ante un 401, limpiar el token y publicar `session:{active:false}`", que `authenticatedGet()` ya implementa aquí. Es una duplicación real y consciente (unas pocas líneas), no un error: unificarla exigiría que el Monitor de Integridad pasara por el Cliente HTTP, acoplando su timeout propio al backoff exponencial del Cliente HTTP y rompiendo el aislamiento entre sus 4 chequeos que exige `08_integrity_monitor.md §5-6`.

## 2. Gestor de Estado Global

Mantiene en memoria la información vigente de cada dominio de datos (partidos, equipos, estadios, grupos) recibida desde el Cliente HTTP. Expone un mecanismo de suscripción para que los módulos reaccionen a cambios sin tener que consultar activamente en cada ciclo.

## 3. Gestor de Caché

Responsable de guardar en `localStorage` la última respuesta exitosa de cada endpoint y de recuperarla cuando una petición nueva falla, según la regla de modo offline definida en `03_business_rules.md`. No decide cuándo mostrar los datos cacheados en pantalla — eso es responsabilidad del módulo consumidor.

También expone `clearCache()`, que vacía toda la caché guardada — capacidad agregada para el cierre de sesión manual (fase de refuerzo de seguridad, `ROADMAP.md`), disparada por el control de logout junto con `clearToken()`.

## 4. Sistema de Eventos

Mecanismo interno de publicación/suscripción usado por el Gestor de Estado Global para notificar a los módulos suscritos. No contiene lógica de negocio; solo transporta la notificación de cambio.

**Vocabulario de topics para estado transversal (sesión, countdown, offline):** además de los cuatro dominios de datos (`games`, `teams`, `stadiums`, `groups`), el Sistema de Eventos usa tres topics fijos para que la Barra de Estado Global (`dashboard_design.md`) refleje el estado de resiliencia definido en `03_business_rules.md`:

- `'session'` — payload: `{ active: boolean, reason: 'expired' | 'manual' | 'initial' | 'login' }`. Se publica cuando cambia el estado de sesión. `reason: 'expired'` es exclusivo del 401 real o de una expiración detectada proactivamente por el cliente (mismo tratamiento, mismo mecanismo — ver `03_business_rules.md` §1); `reason: 'manual'` es exclusivo del logout disparado por el usuario; `reason: 'initial'` se usa en el arranque con token ya existente (sin login explícito en esta carga de página); `reason: 'login'` se usa exclusivamente cuando el usuario acaba de autenticarse explícitamente (envío del formulario de login). Cualquier consumidor de este evento (por ejemplo, el mensaje del overlay de login) debe usar `reason` para decidir su texto — nunca asumir el motivo a partir de otro estado, y nunca reutilizar un valor existente para un caso semánticamente distinto solo porque hoy nada lo consuma.
- `'countdown'` — payload: `{ secondsRemaining: number }`. Se publica en cada segundo de espera durante un backoff por 429, según `03_business_rules.md` §4.
- `'offline'` — payload: `{ stale: boolean }`. Se publica cuando un módulo muestra datos cacheados en vez de datos frescos.

Cualquier módulo que dispare uno de estos tres estados (Fase 3) debe publicar usando exactamente estos nombres de topic y esta forma de payload — no se introducen nombres alternativos. Este vocabulario es propiedad de este documento; ningún módulo puede redefinirlo.

## 5. Autenticación (Componente)

Pieza responsable de obtener y almacenar el token JWT, y de exponerlo al Cliente HTTP para construir el encabezado `Authorization`. El comportamiento normativo (qué hacer ante un 401) es propiedad de `03_business_rules.md`; este componente solo lo ejecuta.

También expone `isTokenExpired()`, que decodifica el payload del token para detectar proactivamente su expiración (campo `exp`) sin contactar al servidor. El criterio de cuándo y dónde se usa esta función es propiedad de `03_business_rules.md §1`; este componente solo la implementa.

## 6. Sistema de Notificaciones (Toasts)

Componente reutilizable para mostrar mensajes no bloqueantes en pantalla (toasts), usado por cualquier módulo que necesite informar un evento sin interrumpir el flujo — por ejemplo, un cambio de marcador o una pausa por backoff. Nunca usa `alert()`, conforme a la prohibición absoluta de `03_business_rules.md`.

## 7. Envoltorio de Timeout con `AbortController`

Utilidad reutilizable que envuelve una llamada `fetch` con un límite de tiempo configurable, cancelando la petición mediante `AbortController` si se supera. Cada módulo que la use define su propio tiempo límite y su propio manejo del estado de "tiempo agotado"; esta pieza solo provee el mecanismo de cancelación, no decide qué hacer con el resultado.

## 8. Utilidades Compartidas

Funciones auxiliares de uso general (formateo de fechas, comparación de objetos para detectar cambios, helpers de manipulación de DOM genéricos) que no pertenecen a la lógica de ningún módulo específico.

---

## Lo que este documento NO cubre

Este documento NO define:

- Cómo se relacionan estas piezas entre capas ni la dirección del flujo de datos (vive en `02_architecture.md`).
- Reglas de negocio: JWT, manejo de 401, backoff, offline (vive en `03_business_rules.md`; estas piezas las implementan, no las definen).
- Endpoints ni forma de las respuestas de la API (vive en `04_api_contract.md`).
- Comportamiento específico de ningún módulo.
- Diseño visual de los toasts ni de ningún otro componente.