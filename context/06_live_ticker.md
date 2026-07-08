# 06_live_ticker.md

## Encabezado

**Propósito:** Definir qué hace el módulo Live Ticker.

**Responsabilidad:** ¿Qué hace el módulo Live Ticker?

**Tipo:** Vivo — se espera que acumule casos especiales descubiertos durante la implementación.

**Prioridad:** 6 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
03_business_rules.md
05_shared_infrastructure.md

Necesario para conocer:
- las reglas de backoff y countdown que gobiernan el polling
- el Cliente HTTP, el Estado Global y el Sistema de Notificaciones ya existentes
```

**Alcance:** Objetivo, flujo, estados y casos especiales propios de este módulo. No define arquitectura, autenticación, ni el Cliente HTTP — esas piezas ya existen y este módulo solo las consume.

---

## 1. Objetivo

Monitorear los partidos en tiempo casi real mediante polling periódico con backoff exponencial y notificaciones no bloqueantes construidas en el DOM, mostrando cambios de marcador en tiempo casi real.

## 2. Endpoint Consumido

`GET /get/games` (forma definida en `04_api_contract.md`).

## 3. Flujo

1. El módulo inicia un ciclo de polling periódico sobre `/get/games`, delegando cada llamada en el Cliente HTTP compartido.
2. En cada ciclo, compara el estado anterior guardado en memoria del módulo contra la respuesta nueva.
3. Si detecta un cambio de marcador en cualquier partido, dispara una notificación tipo toast usando el Sistema de Notificaciones compartido — nunca `alert()`.
4. El toast aparece y se retira solo tras unos segundos, sin intervención adicional del usuario.

## 4. Estados del Módulo

- **Actualizando:** el ciclo de polling está en curso normalmente.
- **En pausa por backoff:** el último ciclo devolvió 429; el módulo espera según la regla de backoff exponencial de `03_business_rules.md`, mostrando el countdown correspondiente.
- **Con marcadores vigentes:** los últimos marcadores mostrados, ya sea de la respuesta más reciente o de la copia cacheada si aplica el modo offline.

## 5. Caso Especial: Reto de Resiliencia

Si un ciclo de polling devuelve 429:

- El intervalo de espera se duplica en cada reintento (backoff exponencial), mostrando el countdown correspondiente, según lo ya definido en `03_business_rules.md`.
- Mientras dura el backoff, se muestra un toast discreto de "actualización en pausa".
- El resto del ticker no se congela ni se borran los marcadores ya mostrados — el ticker permanece visible con la última información válida mientras el backoff está en curso.

## 6. Comportamiento Esperado

- El polling nunca se detiene de forma permanente ante un error recuperable; siempre reintenta según la regla de backoff.
- Un cambio de marcador siempre genera un toast, nunca una alerta bloqueante.
- El estado anterior en memoria se actualiza únicamente después de comparar contra la respuesta nueva, para no perder la referencia de comparación del siguiente ciclo.

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de JWT, 401, backoff, offline ni prohibiciones absolutas (vive en `03_business_rules.md`).
- Cómo funciona el Cliente HTTP, el Estado Global o el Sistema de Notificaciones (vive en `05_shared_infrastructure.md`).
- La forma del endpoint `/get/games` (vive en `04_api_contract.md`).
- Arquitectura general de la aplicación (vive en `02_architecture.md`).
- Diseño visual del toast o del ticker (vive en los documentos de UX).
