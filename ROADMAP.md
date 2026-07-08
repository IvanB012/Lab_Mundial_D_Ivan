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

**Estado:** ⏳ Pendiente

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

**Estado:** ⏳ Pendiente

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

**Estado:** ⏳ Pendiente

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

**Estado:** ⏳ Pendiente

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

**Estado:** ⏳ Pendiente

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

**Estado:** ⏳ Pendiente

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de negocio, arquitectura, endpoints, infraestructura, comportamiento de módulos ni diseño visual — cada fase solo referencia el documento correspondiente en `/context`.
- Contenido de la rúbrica de defensa ni las preguntas del profesor — vive en `/project`.
- Cómo debe comportarse Claude Code dentro de una tarea puntual — vive en `00_assistant_contract.md`.
