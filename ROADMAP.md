# ROADMAP.md

## Encabezado

**Propósito:** Definir en qué orden se construye el proyecto y qué criterio marca que cada fase está realmente terminada.

**Responsabilidad:** ¿En qué orden se construye el proyecto y cómo se sabe que cada fase está lista para avanzar a la siguiente?

**Tipo:** Vivo — se actualiza al cerrar cada fase.

**Ubicación:** Raíz del proyecto, fuera de `/context`. No forma parte del contexto operativo que Claude Code carga para ejecutar una tarea puntual; es un documento de planificación y estado del proyecto en el tiempo.

**Dependencias:** Referencia a los documentos de `/context` correspondientes a cada fase, sin repetir su contenido.

**Alcance:** Secuencia de fases y sus criterios de cierre. No define reglas de negocio, arquitectura, endpoints, comportamiento de módulos ni diseño visual — para eso, cada fase remite al documento correspondiente.

---

## Cómo Usar Este Documento

- Al iniciar una sesión de trabajo, se consulta este Roadmap para saber en qué fase está el proyecto actualmente.
- Ninguna fase se marca como completada sin ejecutar su Validación y Cierre.
- Este documento nunca es fuente de reglas ni de comportamiento — solo indica secuencia y estado. Para el "cómo" de cualquier fase, se consulta el documento de `/context` referenciado en ella.
- Actualizar el estado de una fase es parte obligatoria de su cierre, no un paso opcional posterior.

---

## Fase 0 — Inicialización del Proyecto

**Objetivo:** Dejar listo el entorno base sobre el que se construirá todo lo demás.

**Documentos relevantes:** `01_project_overview.md`

**Contenido de la fase (a nivel de qué, no de cómo):**
- Inicialización del proyecto con Vite.
- Estructura de carpetas base del código fuente.
- Configuración mínima para que el proyecto arranque en modo desarrollo.

**Validación y Cierre (Definition of Done):**
- El proyecto arranca sin errores en modo desarrollo.
- La estructura de carpetas está creada y es coherente con las capas descritas en `02_architecture.md`.
- No existe todavía lógica de negocio ni llamadas a la API — esta fase es exclusivamente de andamiaje.

**Estado:** ✅ Completada

---

## Fase 1 — Infraestructura Compartida

**Objetivo:** Construir las piezas reutilizables que todos los módulos necesitarán.

**Documentos relevantes:** `02_architecture.md`, `03_business_rules.md`, `05_shared_infrastructure.md`, `04_api_contract.md`

**Contenido de la fase:**
- Cliente HTTP.
- Gestor de Estado Global.
- Gestor de Caché (`localStorage`).
- Sistema de Eventos.
- Componente de Autenticación (JWT).
- Sistema de Notificaciones (toasts).
- Envoltorio de timeout con `AbortController`.

**Validación y Cierre (Definition of Done):**
- El Cliente HTTP ejecuta una petición real contra la API y respeta el encabezado de autenticación definido en `03_business_rules.md`.
- El manejo de 401, 429 (con countdown) y 500 (con backoff exponencial) está probado de forma aislada, sin depender todavía de ningún módulo.
- El modo offline recupera correctamente una respuesta cacheada cuando se simula un fallo de red.
- Ninguna de las prohibiciones absolutas (`alert()`, `.then()`/`.catch()`, `reload()`) aparece en el código de esta capa.

**Estado:** ✅ Completada

---

## Fase 2 — Estructura del Dashboard

**Objetivo:** Construir el esqueleto visual sobre el que se montarán los módulos.

**Documentos relevantes:** `dashboard_design.md`, `layout.md`

**Contenido de la fase:**
- Barra de Estado Global (conectada al Estado Global y al Sistema de Notificaciones de la Fase 1).
- Barra de Pestañas con los cinco módulos (sin contenido funcional todavía).
- Zona de Contenido que responde al cambio de pestaña.

**Validación y Cierre (Definition of Done):**
- Cambiar de pestaña reemplaza el contenido visible sin recargar la página.
- La Barra de Estado Global refleja cambios reales de sesión y de countdown usando la infraestructura de la Fase 1 (aunque sea con datos de prueba).
- El layout respeta las medidas y el comportamiento responsive definidos en `layout.md` en al menos los tres rangos de pantalla (escritorio, tablet, móvil).

**Estado:** ✅ Completada

---

## Fase 3 — Implementación de Módulos

**Objetivo:** Construir cada módulo, uno a la vez, sobre la infraestructura y el esqueleto ya validados.

**Orden y documentos relevantes:**
1. `06_live_ticker.md`
2. `07_report_exporter.md`
3. `08_integrity_monitor.md`
4. `09_bilingual_search.md`
5. `10_knockout_tree.md`

**Regla de secuencia:** un módulo no inicia hasta que el anterior cumplió su propia Validación y Cierre. No se construyen dos módulos en paralelo.

**Validación y Cierre (Definition of Done) — aplica individualmente a cada módulo antes de avanzar al siguiente:**
- El flujo principal del módulo funciona contra la API real.
- El caso especial de resiliencia descrito en el documento del módulo está probado explícitamente (por ejemplo, forzando un 429 en Live Ticker o un timeout en Monitor de Integridad).
- El módulo no introduce una segunda barra de estado ni un estilo de toast propio, conforme a `dashboard_design.md`.
- Ninguna prohibición absoluta aparece en el código del módulo.

---

### Ítem adicional de Fase 3 — Login e Inicio de Sesión

**Objetivo:** cerrar el vacío estructural detectado durante la implementación de Live Ticker: ningún documento del sistema asignaba la responsabilidad de iniciar sesión al arrancar la app.

**Cuándo se implementa:** después de que los cinco módulos (Live Ticker → Exportador de Reportes → Monitor de Integridad → Buscador Bilingüe → Árbol de Eliminatorias) cumplieron su propia Validación y Cierre individual, y antes de dar la Fase 3 completa por cerrada.

**Alcance:**
- Una pieza de login independiente, ubicada en `src/presentation/` (nunca dentro de un módulo de dominio), que pide credenciales y llama a `auth.login()` de `05_shared_infrastructure.md`.
- Se dispara una sola vez al arrancar la app, antes de que el usuario acceda al contenido del Dashboard.
- Es la única dueña del evento `'session'` del vocabulario de `05_shared_infrastructure.md` sección 4 — ningún módulo de dominio (`06`–`10`) publica este evento.
- **Prerrequisito de infraestructura:** las rutas `/auth/*` tienen un bug de CORS confirmado en el servidor externo (falta `Access-Control-Allow-Origin`), que bloquea el login real desde cualquier navegador. Antes de implementar esta pieza, se debe configurar un proxy en `vite.config.js` (reenviando `/auth/*` a `https://worldcup26.ir` server-side) y ajustar `src/data/endpoints.js` para usar una base relativa en desarrollo. Ver nota de entorno en `04_api_contract.md` sección 2.

**Validación y Cierre (Definition of Done):**
- Ningún módulo de dominio publica el evento `'session'` — se verifica por grep que solo la pieza de login lo hace.
- El login real funciona contra `POST /auth/authenticate` y la Barra de Estado Global refleja `session: active` correctamente sin importar qué pestaña esté activa.
- Un 401 en cualquier módulo sigue disparando `SessionExpiredError` (ya construido en Fase 1) y la pieza de login reacciona mostrando la opción de reautenticarse, conforme a `03_business_rules.md` sección 3.

**Estado:** ✅ Completada

---

## Fase 4 — Aplicación del Sistema de Diseño

**Objetivo:** Vestir visualmente la estructura y los módulos ya funcionales.

**Documentos relevantes:** `design_system.md`

**Contenido de la fase:**
- Paleta de color semántica aplicada de forma consistente.
- Tipografía y jerarquía visual unificadas.
- Componentes reutilizables (toast, badge, semáforo, botones, countdown) implementados una sola vez y consumidos por todos los módulos.

**Validación y Cierre (Definition of Done):**
- Ningún módulo tiene una variante visual propia de un componente ya definido como reutilizable.
- El significado semántico del color se respeta en los cinco módulos (por ejemplo, rojo siempre es error, nunca decorativo).
- La jerarquía tipográfica es visualmente idéntica entre módulos para el mismo nivel de texto.

**Estado:** ✅ Completada

---

## Fase 5 — Integración Final y Validación Previa a la Defensa Técnica

**Objetivo:** Verificar el sistema completo de punta a punta y dejarlo listo para la defensa oral.

**Documentos relevantes:** todos los anteriores (verificación cruzada), más el material de defensa ubicado en `/project` (fuera de `/context`).

**Contenido de la fase:**
- Prueba integrada de los cinco módulos funcionando simultáneamente dentro del Dashboard.
- Verificación cruzada de cada regla obligatoria de `03_business_rules.md` contra el comportamiento real de la aplicación completa.
- Ensayo de las pruebas prácticas en DevTools (Console y Network) que se esperan durante la defensa oral.

**Validación y Cierre (Definition of Done):**
- Las cinco Validaciones y Cierres de la Fase 3 siguen cumpliéndose con todos los módulos activos al mismo tiempo (no solo de forma aislada).
- Es posible reproducir en vivo, con DevTools abierto, al menos un error 401, un 429 con countdown y un 500 con backoff, sin que la aplicación se rompa visualmente.
- No queda ninguna prohibición absoluta en ninguna parte del código final.
- El estudiante puede justificar cada decisión no trivial señalando el documento de `/context` que la origina.

**Estado:** ✅ Completada

---

## Fase 6 — Mejoras Post-Validación e Integridad Verificada

**Objetivo:** implementar las mejoras confirmadas como reales y de bajo riesgo durante la revisión exploratoria documentada en `IDEAS_A_VALIDAR.md` (puntos 1, 2 y 3), y reforzar con evidencia explícita el Reto de Resiliencia del Árbol de Eliminatorias ya cerrado en Fase 3, antes de la defensa oral.

**Origen:** esta fase no proviene del enunciado original ni del diseño inicial del sistema de contexto — nace de una revisión manual de la aplicación ya terminada, documentada en `IDEAS_A_VALIDAR.md` (raíz del proyecto, fuera de `/context`). Los puntos 4, 5, 6 y 7 de ese documento fueron evaluados y descartados o reconfirmados sin cambios; no forman parte de esta fase.

**Documentos relevantes:** `03_business_rules.md`, `05_shared_infrastructure.md` (vocabulario de eventos), `06_live_ticker.md`, `10_knockout_tree.md`

### Alcance — Parte A: Mensaje de sesión expirada en el login

Distinguir, dentro del overlay de login, entre "primera apertura" y "reapertura por sesión expirada" (401 real o logout manual), mostrando un mensaje explícito en el segundo caso. Reutiliza la bandera `hasStartedOnce` ya existente en `login.js` — sin nuevo topic de eventos ni cambios en `eventBus.js`/`store.js`.

### Alcance — Parte B: Botón de "Cerrar sesión"

- Nuevo control de logout manual, ubicado en `src/presentation/` (junto a `statusBar.js`, no dentro de ningún módulo de dominio), que dispara el mismo mecanismo base que el 401 real: `clearToken()` + `publish('session', {active:false})`. *(Actualizado en Fase 7: el logout manual ya no es idéntico al 401 real — también llama a `clearCache()` para vaciar la caché de `localStorage` de la sesión cerrada, una diferencia intencional. Ver `05_shared_infrastructure.md §3`.)*
- Corrección necesaria y asociada en `06_live_ticker.md`: hoy, `liveTicker.js` solo detiene su polling (`stopped = true`) dentro de su propio manejo de `SessionExpiredError` — nunca al recibir `'session': {active:false}` por otra vía (como este nuevo botón). Se agrega la rama simétrica en el `subscribe('session', ...)` ya existente en `liveTicker.js`, para que cualquier cierre de sesión (401 real o logout manual) detenga el polling.

### Alcance — Parte C: Ambigüedad de marcador "0-0" en partidos no iniciados

En Live Ticker, un partido que aún no comenzó (`finished: "FALSE"`) muestra el mismo `0 - 0` que un partido ya finalizado con ese resultado real, generando ambigüedad. Se aplica el mismo patrón ya usado en `knockoutTree.js` (condicionar por `finished`) para mostrar algo como `"vs"` en vez del marcador cuando el partido no ha iniciado.

### Alcance — Parte D: Reverificación dirigida — Reto de Resiliencia del Árbol de Eliminatorias

No es una corrección de bug — es una reverificación explícita, con evidencia nueva, del comportamiento ya definido en `10_knockout_tree.md` sección 5, solicitada por el usuario tras revisión manual:

- Confirmar que, si la fase eliminatoria aún no tiene datos disponibles (torneo en fase de grupos), el bracket se renderiza igual, con casillas "Por definir" — nunca en blanco.
- Confirmar que, si la petición falla **después** de que el bracket parcial ya se dibujó, las rondas ya resueltas se conservan intactas, y solo las rondas pendientes de cruce se marcan en estado de error — sin afectar el resto.

**Validación y Cierre (Definition of Done):**
- El overlay de login muestra el mensaje distinto correctamente en una reapertura real por sesión expirada, y el formulario estándar en la primera carga.
- El botón de "Cerrar sesión" limpia el token, publica `'session': {active:false}`, y Live Ticker detiene su polling en ese mismo instante (verificable por ausencia de nuevas peticiones a `/get/games` tras el logout).
- Un partido no iniciado muestra `"vs"` (o equivalente) en vez de `"0 - 0"` en Live Ticker; un partido finalizado con marcador 0-0 real sigue mostrando `"0 - 0"` correctamente (no se pierde ese caso).
- Evidencia explícita y reproducible (capturas o registro de red) de ambos escenarios del Reto de Resiliencia del Árbol de Eliminatorias, generada simulando condiciones reales (interceptando la respuesta de red), no alterando el código de la aplicación.
- Ninguna prohibición absoluta aparece en el código nuevo o modificado.
- Los 5 módulos y el login siguen funcionando sin regresión tras estos cambios.

**Estado:** ✅ Completada

**Nota de cierre:** durante la reverificación de la Parte D se encontró una condición de carrera real (no solo un caso teórico) en `knockoutTree.js`: si `/get/teams` fallaba antes de que el bracket terminara de dibujarse en el DOM, el slot pendiente de cruce quedaba congelado en "Verificando equipo…" en vez de marcarse como "Error al cruzar equipo", incumpliendo `10_knockout_tree.md` §5. Se corrigió con tres variables de módulo (`bracketRendered`, `teamsOutcome`, `crossReferenceApplied`) y una función idempotente (`tryApplyCrossReference()`, líneas 34-45) llamada desde ambos flujos de carga (`runGamesLoad` y `runTeamsLoad`), que no depende del orden de resolución de `games`/`teams`. Reconfirmado por lectura directa de código el 19 de julio de 2026, tras una discrepancia detectada entre el estado registrado en una copia del ROADMAP y el estado real del código — el código ya tenía la corrección aplicada correctamente.

---

## Fase 7 — Refuerzo de Seguridad de Sesión y Autenticación (Pre-Defensa)

**Objetivo:** reforzar el manejo del JWT una vez emitido y el cierre de sesión, de cara a la defensa oral, donde el profesor intenta ataques reales (manipular `localStorage`/sesión desde DevTools) para evaluar qué tan protegido está el manejo de credenciales — sin backend propio, BFF ni cookies `HttpOnly`, fuera del alcance de un proyecto frontend puro.

**Origen:** esta fase no proviene del enunciado original ni de `IDEAS_A_VALIDAR.md` — nace de una ronda de auditoría de seguridad solicitada explícitamente por el usuario. La prioridad declarada no es proteger la contraseña en el login (la API es externa, fuera de control), sino proteger el JWT una vez emitido, que es lo que vive en `localStorage` y representa al usuario autenticado durante toda la sesión.

**Documentos relevantes:** `03_business_rules.md` (JWT, manejo de 401), `05_shared_infrastructure.md` (Cliente HTTP, Gestor de Caché, Componente de Autenticación), `08_integrity_monitor.md` (unificación del 401 en sus chequeos, sin tocar su `AbortController`/timeout de 5s).

### Alcance — Parte A: XSS vía `innerHTML`

Reemplazo de `innerHTML` por `createElement`/`textContent`/`dataset` en los 4 módulos que insertaban datos provenientes de la API (nombres de equipo, marcadores, fechas) sin escapar: `liveTickerView.js`, `knockoutTreeView.js`, `bilingualSearchView.js`, `reportExporterView.js`. Sin cambios de comportamiento visual ni de estructura del DOM (mismas clases y atributos `data-*`); `integrityMonitorView.js` no se tocó porque sus valores no provienen de la API.

### Alcance — Parte B: Logout completo

- `logoutButton.js` ahora también llama a `clearCache()` (nueva capacidad de `cache.js`, ver `05_shared_infrastructure.md §3`), además de `clearToken()` y `publish('session', {active:false})`.
- `httpClient.js` agrega un guard: si el token vigente ya cambió cuando llega un 401 (logout + login nuevo mientras una petición vieja seguía en vuelo), ese 401 obsoleto no pisa la sesión nueva.

### Alcance — Parte C: Unificación del manejo de 401 en el Monitor de Integridad

`checkEndpointHealth()` en `store.js` ahora limpia el token y publica `session:{active:false}` ante un 401, igual que el resto de los dominios — antes, un 401 en sus 4 chequeos solo se mostraba como "Error 401" en rojo, sin disparar el mecanismo de sesión expirada. El `AbortController`/timeout de 5s propio del módulo no se modificó. Duplicación de criterio con el Cliente HTTP documentada a propósito en `05_shared_infrastructure.md §1`.

### Alcance — Parte D: Validación proactiva de expiración del JWT

Nueva función `isTokenExpired()` en `auth.js` (decodifica el payload del token para leer `exp`, sin verificar firma — ver `03_business_rules.md §1`). Se chequea en dos puntos: al arrancar la app (`login.js`, antes de omitir el overlay de login) y antes de cada petición autenticada (`httpClient.js`).

### Alcance — Parte E: Credenciales de prueba fuera del repositorio

Las entradas de la allowlist de `.claude/settings.json` que contenían credenciales de prueba en texto plano se movieron a `.claude/settings.local.json` (ya ignorado globalmente, mismo patrón que `.env.development.local`). No se reescribió el historial de Git: credenciales de prueba no reutilizadas fuera del proyecto, confirmado con el usuario.

### Alcance — Parte F: Content-Security-Policy

Meta tag CSP agregado en `index.html` (`default-src 'self'`; `connect-src` habilita `worldcup26.ir` y el `dev-proxy` local; `style-src 'self' 'unsafe-inline'` para no romper el HMR de Vite en desarrollo). Se omitió `frame-ancestors` a propósito: los navegadores la ignoran cuando viene por `<meta>`, solo aplica como header HTTP real, fuera de alcance sin backend propio.

**Validación y Cierre (Definition of Done):**
- Los 5 módulos siguen renderizando visualmente igual tras el cambio de `innerHTML` a `createElement` (verificado con login real contra la API y comparación del HTML resultante).
- Un 401 real forzado en el Monitor de Integridad dispara `clearToken()` + `session:{active:false}` + reaparición del overlay de login (verificado con interceptación de red determinística).
- El logout manual limpia token y caché de `localStorage` (verificado: 0 claves `wc26_cache:*` en `localStorage` tras el logout).
- Un token corrupto o con `exp` vencido en `localStorage` no omite el overlay de login al arrancar; un token válido sí sobrevive un cierre y reapertura completos del navegador (verificado con perfil persistente).
- Ninguna prohibición absoluta (`alert()`, `.then()`/`.catch()`, `window.location.reload()`) aparece en el código nuevo o modificado (verificado por búsqueda sobre todo `src/`).
- Los escenarios de resiliencia ya validados en fases previas (429 con countdown, 500 con backoff, 401 real) siguen comportándose igual contra `dev-proxy.cjs` tras estos cambios (revalidado en vivo).
- `.claude/settings.json` (versionado en Git) no contiene ninguna credencial de prueba en texto plano.

**Estado:** ✅ Completada

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de negocio, arquitectura, endpoints, infraestructura, comportamiento de módulos ni diseño visual — cada fase solo referencia el documento correspondiente en `/context`.
- Contenido de la rúbrica de defensa ni las preguntas del profesor — vive en `/project`.
- Cómo debe comportarse Claude Code dentro de una tarea puntual — vive en `00_assistant_contract.md`.