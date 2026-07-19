# 03_business_rules.md

## Encabezado

**Propósito:** Ser la autoridad máxima sobre las reglas obligatorias y restricciones impuestas por el laboratorio.

**Responsabilidad:** ¿Cuáles son las reglas obligatorias del proyecto?

**Tipo:** Estático — estas reglas provienen del enunciado del profesor y no cambian salvo que el enunciado mismo cambie.

**Prioridad:** 2 (según tabla de `00_assistant_contract.md`, sección 6). Solo el Assistant Contract tiene mayor autoridad.

**Dependencias:**
```
Depende de:
00_assistant_contract.md
01_project_overview.md

Necesario para conocer:
- el propósito general del proyecto sobre el que aplican estas reglas
```

**Alcance:** Reglas obligatorias de comportamiento del software: autenticación, manejo de errores HTTP, resiliencia y prohibiciones absolutas. No define endpoints ni forma de la API (eso es `04_api_contract.md`), ni componentes de infraestructura (eso es `05_shared_infrastructure.md`).

**Nota de propiedad:** Este documento es el único dueño de JWT, manejo de 401, backoff exponencial (429/500) y modo offline. Ningún otro documento puede redefinir estas reglas; solo puede referenciarlas por nombre.

---

## 1. Autenticación JWT

- Toda petición a un endpoint de datos debe incluir el encabezado `Authorization: Bearer <token>`.
- Ninguna llamada a un endpoint de datos puede omitir este encabezado.
- El token se obtiene autenticándose contra la API antes de realizar cualquier petición de datos.
- La forma de obtener el token y el endpoint de autenticación se definen en 04_api_contract.md
- Además del manejo reactivo del 401 (sección 3), el cliente detecta la expiración de forma proactiva decodificando el payload del JWT y comparando su campo `exp` contra la hora actual (`isTokenExpired()`, expuesta por el Componente de Autenticación — `05_shared_infrastructure.md §5`). Es una detección de expiración, no una verificación de firma: no puede confirmar que el token sea auténtico ni detectar uno forjado, solo que venció según su propio `exp` — limitación consistente con la nota de `04_api_contract.md §1` sobre que la API real no valida el contenido del token en `GET /get/*`.

## 2. `async/await` Exclusivo

- Toda llamada a `fetch` se resuelve con `async/await`.
- No se acepta `.then()` ni `.catch()` en ninguna parte del código entregado, ni siquiera conviviendo con `async/await` en otro archivo.

## 3. Manejo del Error 401

- Si la API responde 401, la interfaz debe limpiar el token guardado.
- Debe mostrarse una pantalla o modal de "sesión expirada" con opción de reautenticarse.
- Está prohibido usar `window.location.reload()` o cualquier equivalente para resolver este error.

## 4. Backoff Exponencial (429 y 500)

- Ante un error 500 (servidor) o 429 (límite de tasa), el cliente reintenta automáticamente con espera creciente (por ejemplo: 1s, 2s, 4s, 8s).
- En el caso específico del 429, la interfaz debe mostrar un **countdown visible** en segundos, indicando cuándo ocurrirá el siguiente reintento automático.
- El backoff no debe congelar el resto de la interfaz mientras está en curso.

## 5. Modo Offline con `localStorage`

- La última respuesta exitosa de cada endpoint se guarda en `localStorage`.
- Si una petición nueva falla y existe una copia cacheada, la interfaz debe mostrar esos datos junto con un indicador visible de que son datos no actualizados.

## 6. Prohibiciones Absolutas

Ningún módulo puede contener, bajo ninguna circunstancia:

- `alert()`, en cualquier punto del flujo, incluyendo el manejo de errores.
- `.then()` o `.catch()`, incluso si conviven con `async/await` en otra parte del archivo.
- `window.location.reload()` (o equivalente) como mecanismo para resolver un error de sesión o de red.

Estas tres prohibiciones son absolutas y no admiten excepciones justificadas por conveniencia de implementación.

---

## Lo que este documento NO cubre

Este documento NO define:

- Endpoints, métodos HTTP ni forma de las respuestas de la API (vive en `04_api_contract.md`).
- Componentes concretos de infraestructura compartida, como el cliente HTTP o el gestor de caché (vive en `05_shared_infrastructure.md`).
- `AbortController` como regla general — su uso es específico de los módulos que lo requieran y se define en el documento de ese módulo, no aquí.
- Comportamiento particular de ningún módulo.
- Arquitectura ni diseño visual.
