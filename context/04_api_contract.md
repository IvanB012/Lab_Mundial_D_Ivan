# 04_api_contract.md

## Encabezado

**Propósito:** Definir cómo debe comunicarse la aplicación con la API externa, a nivel de forma: endpoints, métodos y estructura de las respuestas.

**Responsabilidad:** ¿Cómo debe comunicarse la aplicación con la API?

**Tipo:** Estático — la forma de la API no cambia salvo que el proveedor externo la modifique.

**Prioridad:** 4 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
03_business_rules.md

Necesario para conocer:
- las reglas de autenticación, errores y reintentos que gobiernan cada llamada aquí descrita
```

**Alcance:** Forma de la API — endpoints, métodos, campos de respuesta. No define comportamiento ante errores, reintentos, backoff ni caché; eso pertenece a `03_business_rules.md`, este documento solo referencia esas reglas por nombre.

---

## 1. Autenticación

Toda petición a los endpoints de datos requiere el encabezado `Authorization: Bearer <token>`. El comportamiento completo de autenticación, incluyendo el manejo de expiración (401), es propiedad de `03_business_rules.md` — este documento no lo redefine.

El token se obtiene mediante uno de estos dos endpoints:

### `POST /auth/register`

Body: `{ "name", "email", "password" }`
Respuesta: `{ "user": {...}, "token": "<jwt>" }`

### `POST /auth/authenticate`

Body: `{ "email", "password" }`
Respuesta: `{ "user": {...}, "token": "<jwt>" }`

Nota de verificación: el nombre de esta ruta difiere del texto del README público del proveedor de la API (que la describe como "login"). La ruta real, confirmada contra el Swagger en vivo del servidor de producción, es `/auth/authenticate`. Esta es la fuente de verdad — no `/auth/login`.

Ambos son las únicas rutas que no requieren el encabezado `Authorization`.

## 2. Base de la API

```
https://worldcup26.ir
```

**Nota de entorno de desarrollo — bug de CORS en rutas de autenticación:** el servidor de producción no incluye el encabezado `Access-Control-Allow-Origin` en las respuestas (ni en el preflight `OPTIONS`) de `/auth/register` ni `/auth/authenticate`, a diferencia de los endpoints `GET /get/*`, que sí lo incluyen (`*`). Esto es un bug de configuración del proveedor externo, confirmado y no atribuible a nuestro código. En desarrollo, el proyecto usa un proxy del servidor de Vite (`vite.config.js`) que reenvía las peticiones de autenticación evitando la restricción de CORS del navegador. La forma de los endpoints documentada abajo no cambia — solo la ruta base usada en desarrollo es relativa (`/api`) en vez de absoluta.

## 3. Endpoints Disponibles

### `GET /get/games`

Devuelve la lista de partidos.

Campos relevantes (verificados contra la respuesta real de la API):
- `id` — identificador del partido.
- `home_team_id`, `away_team_id` — referencian a `GET /get/teams`.
- `home_score`, `away_score` — marcador actual (usado para detectar cambios en Live Ticker).
- `time_elapsed`, `finished` — estado temporal del partido.
- `home_team_name_en`, `away_team_name_en` — nombres de equipo ya embebidos en la respuesta (no requieren cruce adicional con `/get/teams` para mostrarse en inglés).
- `type` — fase del partido. El valor `"group"` corresponde a fase de grupos; cualquier otro valor corresponde a fase eliminatoria.

### `GET /get/teams`

Devuelve la lista de equipos.

Campos relevantes:
- `name_en`, `name_fa` — nombre del equipo en inglés y en farsi respectivamente.
- Identificador de equipo, referenciado por `home_team_id` / `away_team_id` en `/get/games`.

### `GET /get/stadiums`

Devuelve la lista de estadios.

Campos relevantes:
- `name_en`, `name_fa` — nombre del estadio en inglés y en farsi respectivamente.

### `GET /get/groups`

Devuelve la información de grupos de la fase de grupos.

---

## 4. Comportamiento Ante Errores y Reintentos

Este documento no define qué hacer ante un 401, 429 o 500, ni la política de backoff o caché. Esa información es propiedad exclusiva de `03_business_rules.md`. Cualquier llamada a los endpoints aquí descritos debe implementarse respetando esas reglas.

---

## Lo que este documento NO cubre

Este documento NO define:

- Comportamiento ante errores HTTP (401, 429, 500) — vive en `03_business_rules.md`.
- Backoff, reintentos ni countdown — vive en `03_business_rules.md`.
- Modo offline ni políticas de caché — vive en `03_business_rules.md`.
- Componentes de infraestructura que consumen estos endpoints (cliente HTTP, gestor de estado) — vive en `05_shared_infrastructure.md`.
- Lógica de negocio de ningún módulo.