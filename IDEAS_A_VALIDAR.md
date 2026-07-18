# IDEAS_A_VALIDAR.md

## Propósito

Este documento **no forma parte de `/context`** y **no es una fuente de reglas**. Es una lista de observaciones encontradas por el usuario al usar la aplicación real (interacción manual, no solo revisión de código), que deben ser **investigadas y confirmadas antes de decidir si se implementan**.

Para cada punto, Claude Code debe:
1. Investigar el código real relevante (sin modificarlo todavía).
2. Confirmar si el problema/observación es real, ya está resuelto, o no aplica.
3. Si es real y vale la pena resolverlo, proponer el enfoque de menor riesgo, sin implementarlo todavía.
4. Señalar si algo requeriría tocar una pieza ya cerrada (`/context`, `store.js`, otro módulo) que necesite aprobación explícita.

No se espera código en esta ronda — solo diagnóstico y propuesta.

---

## 1. Mensaje de "sesión expirada" en el overlay de login

Actualmente, cuando la sesión expira y reaparece el overlay de login, se muestra el mismo formulario vacío que en la primera carga de la app. La idea es mostrar un mensaje corto explícito ("Tu sesión expiró, inicia sesión de nuevo") en ese caso, distinto de la primera apertura.

**Preguntas a responder:**
- ¿Existe ya alguna forma de distinguir "primera carga" de "reapertura por sesión expirada" en el código actual de `login.js`?
- Si existe, ¿cómo se podría aprovechar sin duplicar lógica?
- Si no existe, ¿cuál sería la forma menos invasiva de agregarla?

## 2. Botón de "Cerrar sesión"

El proyecto no tiene ninguna forma manual de salir de la sesión activa. La idea es agregar un botón de "Cerrar sesión" que reutilice el mismo mecanismo que ya existe para el 401 (`SessionExpiredError` → `publish('session', {active:false})`), en vez de crear un flujo nuevo.

**Preguntas a responder:**
- ¿Se puede disparar ese mismo mecanismo manualmente desde un botón sin generar inconsistencias?
- ¿Hay procesos en segundo plano (el polling de Live Ticker) que también deban detenerse al cerrar sesión manualmente, y ya lo hacen, o habría que agregarlo?

## 3. Marcadores nulos en el Live Ticker

Sospecha de que, cuando un partido todavía no tiene marcador registrado, la API puede devolver un valor vacío/nulo en vez de un número, y que la interfaz podría estar mostrando ese valor tal cual.

**Preguntas a responder:**
- ¿Esto realmente ocurre? Verificar contra datos reales de la API.
- Si ocurre, ¿cómo se procesa hoy ese campo antes de mostrarlo?
- Si hay un caso sin manejar, proponer cómo debería mostrarse (por ejemplo "vs" o "Por definir" en vez del valor crudo).

## 4. Aislamiento de peticiones en el Monitor de Integridad

Duda sobre si las 4 verificaciones (equipos, grupos, partidos, estadios) corren realmente aisladas entre sí, o si podrían estar acopladas de alguna forma no evidente.

**Preguntas a responder:**
- Si se simula latencia alta en una sola petición hasta agotar su tiempo límite, ¿solo esa verificación se marca como fallida, o afecta a las demás?
- ¿Cada endpoint maneja su propio ciclo de vida de forma aislada, o comparten algún recurso que podría generar acoplamiento?

(Nota: esto ya se verificó explícitamente en el cierre de este módulo en Fase 3 — se espera una reconfirmación rápida, no una investigación desde cero, salvo que se encuentre algo nuevo.)

## 5. Conectores visuales en el bracket del Árbol de Eliminatorias

Idea de mostrar el bracket con líneas/conectores entre cada partido y el cruce de la siguiente ronda, en vez de solo columnas separadas.

**Preguntas a responder:**
- ¿Las alturas de las tarjetas de ronda son predecibles o variables?
- ¿Cuál sería el enfoque más viable: conectores con CSS puro, o un SVG superpuesto calculado dinámicamente?
- Recomendación justificada antes de aplicar cualquier cambio visual.

(Nota: esta es una mejora estética, no una corrección de un problema funcional — no está en `10_knockout_tree.md` ni en el enunciado original. Evaluar con esa expectativa.)

## 6. Verificación del caché en memoria del Buscador Bilingüe

Confirmar que el módulo no vuelve a pedir datos a la API cada vez que se cambia el idioma — que los datos en ambos idiomas se guardan una sola vez y el switch solo lee de esa copia local.

**Preguntas a responder:**
- ¿Esto se cumple tal cual hoy?
- ¿Hay algún caso (cambios muy rápidos de idioma, recargas del módulo) donde podría generar peticiones innecesarias?

(Nota: ya se verificó "0 peticiones tras 5 clicks" en el cierre de este módulo. El caso de "cambios muy rápidos" no se probó explícitamente — foco de esta reconfirmación.)

## 7. Robustez del renderizado en el Árbol de Eliminatorias

Confirmar que el módulo maneja bien los casos de datos de fases avanzadas aún no disponibles: casillas "Por definir" en vez de vacías, y que un fallo de red a mitad del proceso no borre las rondas ya cargadas exitosamente.

**Preguntas a responder:**
- ¿Ambos comportamientos ya se cumplen?
- ¿Alguna ronda depende de otra de forma que pueda romper este aislamiento?

(Nota: ya se verificó en el cierre de este módulo. Reconfirmación rápida esperada.)

---

## Siguiente paso

Con las respuestas de Claude Code a estos 7 puntos, el usuario y el Technical Lead decidirán cuáles se implementan. Lo aprobado se formalizará como una nueva fase del `ROADMAP.md` (Fase 6), siguiendo el mismo formato de Objetivo + Documentos relevantes + Validación y Cierre ya usado en las Fases 0-5 — no como un documento separado.
