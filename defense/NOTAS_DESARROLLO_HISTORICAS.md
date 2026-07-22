# NOTAS_DESARROLLO_HISTORICAS.md

## Propósito

Este documento archiva 7 notas de desarrollo que estaban mezcladas por
error dentro de `ProyectoFinal_ISW521_Categoria_D.md` (a partir de su
línea 179 original), confundiendo el enunciado real del profesor con
instrucciones de trabajo internas. Se separaron aquí para que el
enunciado quede limpio y sin ambigüedad de cara a la defensa.

**Todas las notas listadas abajo ya fueron resueltas.** Cada una
corresponde a una parte específica ya cerrada en `ROADMAP.md` (Fases
6-8). Este documento es solo trazabilidad histórica — no queda ninguna
acción pendiente aquí.

---

## 1. Mensaje de "sesión expirada" en el overlay de login

Resuelto en **Fase 8, Parte B**. `login.js` distingue el motivo de
reapertura del overlay (`reason: 'expired' | 'manual' | 'initial' |
'login'`) y muestra el mensaje correcto en cada caso.

## 2. Botón de cerrar sesión

Resuelto en **Fase 8, Parte B** (origen) y **Fase 8, Parte F**
(ubicación final del control). `logoutButton.js` reutiliza
`clearToken()` + el evento `'session'` ya existente, sin duplicar
lógica del manejo de 401.

## 3. Marcadores nulos ("null - null") en Live Ticker

Resuelto en **Fase 8, Parte A/C** y en el hallazgo de la verificación
integral de Fase 6. `liveTickerView.js` muestra "Por definir" (o
"vs" cuando aplica) en vez del valor crudo cuando el marcador no está
disponible.

## 4. Acoplamiento entre los 4 endpoints del Monitor de Integridad

Resuelto desde el cierre original del módulo en **Fase 3**, y
reconfirmado tras la reorganización de **Fase 9, Parte C**. Cada
chequeo crea su propio `AbortController` independiente
(`fetchWithTimeout` en `timeoutFetch.js`), sin compartir estado entre
los cuatro.

## 5. Conectores visuales del bracket (líneas CSS entre partidos)

Evaluado en `IDEAS_A_VALIDAR.md` punto 5 y **descartado
deliberadamente** por costo/beneficio (alturas de tarjeta variables e
impredecibles, complejidad no trivial de justificar oralmente para una
mejora puramente estética). Decisión registrada, no un pendiente.

## 6. Verificación del caché en memoria del Buscador Bilingüe

Resuelto y verificado en el cierre original del módulo (Fase 3) y
reconfirmado en `IDEAS_A_VALIDAR.md` punto 6. Cero peticiones nuevas
tras cambios de idioma, confirmado explícitamente incluso para el caso
de clics muy rápidos.

## 7. Técnica para forzar 429/500 en DevTools durante la defensa

Resuelto con `dev-proxy.cjs`/`dev-all.cjs` (Fase 7) y documentado en
`defense/DEFENSA_CHAOS.md`, con una alternativa más simple que "Block
Request URL" o edición manual de respuestas: comandos `/__chaos`
dedicados para cada código de error, con `scope` y `times`
configurables.
