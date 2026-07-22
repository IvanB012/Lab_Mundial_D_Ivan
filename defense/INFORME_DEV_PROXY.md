# Informe — Integración de `dev-proxy.cjs` para simular 401/429/500 en la defensa oral

> **Nota (Fase 9, Parte B):** `dev-proxy.cjs` y `dev-all.cjs` se movieron a `/tools` después de este informe. Las rutas mencionadas abajo reflejan su ubicación en el momento en que se escribió este documento.

## 1. Problema de partida

La API real (`worldcup26.ir`) no está bajo nuestro control, así que no hay forma de forzar que devuelva 401, 429 o 500 a demanda para demostrar en la defensa oral cómo la app maneja esos casos (backoff exponencial, countdown del 429, `SessionExpiredError` del 401, fallback a caché del 500).

Un compañero propuso `dev-proxy.js`: un servidor Node standalone que actúa de proxy hacia la API real y expone endpoints de control (`/__chaos/401`, `/429`, `/500`, `/off`) para inyectar esos fallos a demanda, sin tocar el backend real.

Este informe documenta el análisis previo, las decisiones de integración validadas paso a paso con el usuario, la implementación final y los bugs encontrados y corregidos durante la verificación.

## 2. Estado del proyecto antes de este cambio

- [src/data/endpoints.js](src/data/endpoints.js): `BASE_URL` apuntaba fijo a `https://worldcup26.ir`, usado directo (sin proxy) por `getGames/getTeams/getStadiums/getGroups`.
- `AUTH_BASE_URL` sí pasaba por el proxy de [vite.config.js](vite.config.js) en dev (`/api` → rewrite → `worldcup26.ir`), pero solo por un bug de CORS real en `/auth/*`, no para poder simular fallos.
- [src/data/backoff.js](src/data/backoff.js): reintentos con tiempos **fijos** `[1000, 2000, 4000, 8000]` ms ante 429/500, sin leer el header `Retry-After` del servidor (confirmado que es así por diseño, según `03_business_rules.md §4`).
- No existía ningún mecanismo para forzar códigos de error de la API real.

## 3. Decisiones de integración (validadas con el usuario antes de tocar código)

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| `dev-proxy.cjs` corre como **proceso aparte**, en paralelo a Vite (dos terminales) | Reemplazar Vite por completo (`node dev-proxy.js` en vez de `npm run dev`) | Se probó que rompe: [endpoints.js](src/data/endpoints.js) usa `import.meta.env.DEV`, un placeholder que solo Vite reemplaza en tiempo de transformación. Servido como archivo estático crudo, el navegador ejecuta eso contra un `import.meta` nativo sin `.env` y explota (`TypeError`) apenas carga el módulo. |
| `BASE_URL` y `AUTH_BASE_URL` se vuelven condicionales vía variables de entorno `VITE_*`, con fallback al valor actual | Hardcodear la URL del proxy directamente en el código | Con fallback, el comportamiento es **idéntico al actual** si las variables no están definidas — cero riesgo para el resto del proyecto, reversible borrando un archivo. |
| Filtro `scope` (`auth` / `data` / `all`) en el modo caos | Un único interruptor global para toda la API (como venía el script original) | El interruptor original afecta *todas* las rutas por igual; no se podía simular, por ejemplo, "falla el login" sin que también fallara todo lo demás. |
| Default de `times` = **5** (no infinito) cuando no se especifica | Dejar el default original (`Infinity`) | Riesgo de quedar "pegado" fallando toda la demo si te olvidás de `/__chaos/off`. 5 da margen de sobra sobre el máximo de 4 reintentos de `backoff.js`, y cubre las 4 verificaciones en paralelo del Monitor de Integridad. |

## 4. Archivos creados / modificados

### 4.1 `dev-proxy.cjs` (nuevo, raíz del proyecto)

Servidor Node puro (sin dependencias externas) que cumple tres roles: proxy hacia `worldcup26.ir`, servidor de archivos estáticos (no usado en este setup, ver §6) y control de inyección de fallos.

**Cambios sobre el script original del compañero:**

1. **Extensión `.cjs` en vez de `.js`** — el `package.json` del proyecto tiene `"type": "module"`, así que un `.js` se interpreta como ES Module y el `require()` del script rompe al arrancar (bug real, encontrado en la verificación — ver §7).
2. **CORS explícito** — el navegador ahora le pega directo a `localhost:8000` (origen distinto a `localhost:5173`), a diferencia del uso original como proxy servidor-a-servidor. Se agregó manejo de preflight `OPTIONS` y el header `Access-Control-Allow-Origin` tanto en las respuestas inyectadas como en las reenviadas desde el upstream.
3. **Filtro `scope`** — el estado global de caos ahora incluye `scope: 'auth' | 'data' | 'all'`, y `maybeInjectFault` solo actúa si la ruta de la petición matchea el scope activo.
4. **Default seguro de `remaining`** — sin `times`, cae en `5` en vez de `Infinity`; `times=0` pide infinito de forma explícita.
5. **Drenado del body en peticiones inyectadas** (`req.resume()`) — necesario porque ahora el chaos también intercepta `POST /auth/*` (antes solo interceptaba `GET`), y no drenar el body de un POST puede corromper el parseo de la siguiente petición en una conexión keep-alive.

```js
#!/usr/bin/env node
/* ============================================================
   dev-proxy.js — Servidor de desarrollo
   ============================================================ */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 8000;
const ROOT = __dirname;
const UPSTREAM = 'https://worldcup26.ir';

// Prefijos que se reenvían a la API (todo lo demás se sirve como archivo).
const API_PREFIXES = ['/auth', '/get', '/health', '/api'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

const isApiPath = (p) => API_PREFIXES.some((pre) => p === pre || p.startsWith(`${pre}/`));

/* ============================================================
   CORS — el navegador le pega a este proxy en un origen distinto
   (localhost:8000) al de la app (localhost:5173 vía Vite), así que
   esto ya no es servidor-a-servidor: hace falta responder CORS
   propio, incluyendo el preflight OPTIONS que dispara cualquier
   fetch con header Authorization o Content-Type: application/json.
   ============================================================ */
function handlePreflight(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
  });
  res.end();
}

/* ============================================================
   INYECCIÓN DE FALLOS
   ============================================================ */
let chaos = { status: 0, remaining: 0, scope: 'all' };

// /auth/* (login/register) vs /get,/health,/api (resto de los datos).
function scopeOf(pathname) {
  return pathname.startsWith('/auth') ? 'auth' : 'data';
}

function handleChaosControl(req, res, pathname) {
  const m = pathname.match(/^\/__chaos(?:\/(off|401|429|500))?$/);
  if (!m) return false;
  const cmd = m[1];
  const params = new URL(req.url, 'http://x').searchParams;

  if (cmd === 'off') {
    chaos = { status: 0, remaining: 0, scope: 'all' };
  } else if (cmd) {
    const timesParam = params.get('times');
    const times = Number(timesParam);
    const scopeParam = params.get('scope');
    const scope = ['auth', 'data'].includes(scopeParam) ? scopeParam : 'all';
    // Sin "times" (timesParam === null): 5 intentos por defecto (no
    // infinito), para no quedar "pegado" si te olvidás de /__chaos/off
    // en medio de la demo. times=0 pide infinito de forma explícita.
    const remaining = timesParam === '0' ? Infinity : Number.isFinite(times) && times > 0 ? times : 5;
    chaos = { status: Number(cmd), remaining, scope };
  }

  const view = {
    activo: chaos.status !== 0,
    status: chaos.status || null,
    scope: chaos.scope,
    restantes: chaos.remaining === Infinity ? '∞ (hasta /__chaos/off)' : chaos.remaining,
  };
  console.log(`[chaos] control -> ${cmd || 'consulta'}:`, view);
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ ok: true, chaos: view }, null, 2));
  return true;
}

function maybeInjectFault(req, res, pathname) {
  if (!chaos.status || chaos.remaining <= 0) return false;
  if (chaos.scope !== 'all' && chaos.scope !== scopeOf(pathname)) return false;
  if (chaos.remaining !== Infinity) chaos.remaining -= 1;

  // Drena el body sin leerlo (relevante ahora que también se puede
  // inyectar en POST /auth/*): si no se consume, puede quedar basura en
  // el socket que rompa el parseo de la siguiente petición keep-alive.
  req.resume();

  const status = chaos.status;
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'X-Chaos-Injected': String(status), // visible en Network > Headers
  };
  if (status === 429) {
    headers['Retry-After'] = '1';
    headers['Access-Control-Expose-Headers'] = 'Retry-After';
  }

  const body = {
    error: `Fallo inyectado (${status}) por dev-proxy /__chaos — solo para la defensa`,
    status,
    endpoint: req.url,
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
  const left = chaos.remaining === Infinity ? '∞' : chaos.remaining;
  console.log(`[chaos] ${status} (scope=${chaos.scope}) inyectado -> ${req.method} ${req.url}  (restan: ${left})`);
  return true;
}

/* -------------------- Proxy a la API upstream -------------------- */
function proxy(req, res) {
  const target = new URL(req.url, UPSTREAM);

  // Copiamos las cabeceras del cliente pero corregimos Host y quitamos
  // las de origen del navegador: al ir servidor-a-servidor no hay CORS,
  // y así el upstream ve una petición "limpia".
  const headers = { ...req.headers, host: target.host };
  delete headers.origin;
  delete headers.referer;

  const upstreamReq = https.request(
    {
      hostname: target.hostname,
      port: 443,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      // El upstream no conoce (ni le importa) el origen real del navegador
      // (localhost:8000); garantizamos el CORS nosotros en la respuesta
      // que sale de este proxy, sin depender de lo que mande worldcup26.ir.
      const responseHeaders = {
        ...upstreamRes.headers,
        'access-control-allow-origin': req.headers.origin || '*',
      };
      res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
      upstreamRes.pipe(res);
    },
  );

  upstreamReq.on('error', (err) => {
    console.error(`[proxy] error -> ${req.method} ${req.url}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Bad gateway (dev-proxy no pudo contactar el upstream)' }));
  });

  // Reenvía el cuerpo (POST /auth/*) tal cual.
  req.pipe(upstreamReq);
}

/* -------------------- Servir archivos estáticos -------------------- */
function serveStatic(req, res) {
  // Normaliza y evita path traversal fuera de ROOT.
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(ROOT, urlPath === '/' ? '/index.html' : urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

http
  .createServer((req, res) => {
    const pathname = req.url.split('?')[0];
    // Endpoint de control de la inyección de fallos (defensa).
    if (pathname === '/__chaos' || pathname.startsWith('/__chaos/')) {
      if (handleChaosControl(req, res, pathname)) return;
    }
    if (isApiPath(pathname)) {
      if (req.method === 'OPTIONS') {
        handlePreflight(req, res);
        return;
      }
      if (maybeInjectFault(req, res, pathname)) return; // fallo forzado, no llega al upstream
      proxy(req, res);
    } else {
      serveStatic(req, res);
    }
  })
  .listen(PORT, () => {
    console.log(`\n  CyberCup 26 · dev-proxy`);
    console.log(`  ▸ App:      http://localhost:${PORT}`);
    console.log(`  ▸ API  →    ${UPSTREAM}  (proxy de ${API_PREFIXES.join(', ')})`);
    console.log(`  ▸ Caos:     /__chaos/401|429|500[?scope=auth|data][&times=N] · /__chaos/off`);
    console.log(`  ▸ Ctrl+C para detener\n`);
  });
```

### 4.2 `src/data/endpoints.js` (modificado)

```diff
-export const BASE_URL = 'https://worldcup26.ir'
+// VITE_API_BASE_URL / VITE_AUTH_BASE_URL: opcionales, solo para apuntar
+// a dev-proxy.cjs durante la defensa oral (ver .env.development.local).
+// Sin definir, el comportamiento es idéntico al de siempre.
+export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://worldcup26.ir'
 
 // Prerrequisito del ítem de Login (ROADMAP.md): /auth/* tiene un bug de
 // CORS real en el servidor (falta Access-Control-Allow-Origin). En
 // desarrollo se sirve vía el proxy de vite.config.js (mismo origen);
 // en producción usaría la URL absoluta real, igual que el resto.
-export const AUTH_BASE_URL = import.meta.env.DEV ? '/api' : BASE_URL
+export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || (import.meta.env.DEV ? '/api' : BASE_URL)
```

**Por qué no afecta el comportamiento actual:** Vite solo expone al código de cliente las variables de entorno prefijadas con `VITE_`. Si `VITE_API_BASE_URL`/`VITE_AUTH_BASE_URL` no están definidas (no existe `.env.development.local`, o no las contiene), `import.meta.env.VITE_API_BASE_URL` es `undefined`, y `undefined || 'https://worldcup26.ir'` cae en el string fijo de siempre. `vite.config.js` (el proxy `/api` → `worldcup26.ir`) no se tocó en absoluto.

### 4.3 `.env.development.local` (nuevo, no versionado)

```
VITE_API_BASE_URL=http://localhost:8000
VITE_AUTH_BASE_URL=http://localhost:8000
```

Ya cubierto por la regla `*.local` en [.gitignore:13](.gitignore#L13) — no hace falta tocar el `.gitignore`. Este archivo apunta ambas variables al mismo `dev-proxy.cjs`, que ya sabe distinguir `/auth/*` de `/get/*` internamente.

### 4.4 `DEFENSA_CHAOS.md` (nuevo)

Guía de referencia rápida con las URLs de control para los 6 casos de la defensa (401/429/500 × scope auth/data/all), instrucciones de arranque y notas sobre los defaults. Contenido completo en [DEFENSA_CHAOS.md](DEFENSA_CHAOS.md).

## 5. Cómo funciona el mecanismo, de punta a punta

1. `npm run dev` (Vite, puerto 5173) + `node dev-proxy.cjs` (puerto 8000) corren en paralelo.
2. Con `.env.development.local` presente, `BASE_URL` y `AUTH_BASE_URL` valen `http://localhost:8000` en vez de `https://worldcup26.ir` o `/api`.
3. Cualquier fetch de la app (`coreRequest` en [requestCore.js](src/data/requestCore.js)) va entonces a `localhost:8000/<path>`.
4. `dev-proxy.cjs` recibe la petición:
   - Si es `OPTIONS` → responde el preflight CORS y corta.
   - Si el modo caos está activo **y** el scope matchea la ruta (`/auth` → `auth`, cualquier otra ruta de API → `data`) → devuelve el status simulado (401/429/500) sin tocar la API real, decrementando el contador `remaining`.
   - Si no → reenvía la petición server-to-server a `worldcup26.ir` y devuelve la respuesta real.
5. Del lado de la app, no hace falta ningún cambio: el `401` dispara `SessionExpiredError` ([httpClient.js](src/data/httpClient.js)), el `429`/`500` disparan `retryWithBackoff` ([backoff.js](src/data/backoff.js)) con la política fija de 1s/2s/4s/8s ya existente.

## 6. Decisiones que quedaron fuera de alcance (a propósito)

- **No se usa la capacidad de `serveStatic` de `dev-proxy.cjs`**: Vite sigue siendo el único servidor de la app (HMR, resolución de módulos). El branch de archivos estáticos del proxy queda sin uso, sin que eso genere ningún conflicto.
- **`vite.config.js` no se tocó**: su proxy `/api` → `worldcup26.ir` sigue funcionando exactamente igual; simplemente deja de ser el único camino cuando `VITE_AUTH_BASE_URL` está seteada.
- **Script de arranque conjunto con `concurrently`**: se propuso y quedó pendiente de confirmación explícita — no se agregó a `package.json`. Se sigue arrancando con dos terminales manuales.
- **`backoff.js` no lee `Retry-After`**: el proxy manda ese header en el 429 (`Retry-After: 1`) por completitud, pero el cliente sigue una política fija de reintentos y lo ignora — comportamiento intencional y ya documentado en `03_business_rules.md §4`, no se modificó.

## 7. Verificación realizada

Se levantó `dev-proxy.cjs` y se probaron los 6 casos con `curl` antes de entregar la integración como cerrada. En el proceso se encontraron y corrigieron dos bugs reales:

| # | Bug encontrado | Causa | Fix |
|---|---|---|---|
| 1 | `ReferenceError: require is not defined in ES module scope` al arrancar | `package.json` tiene `"type": "module"`; un `.js` se trata como ESM por defecto y `require()` no existe ahí | Renombrado `dev-proxy.js` → `dev-proxy.cjs` (fuerza CommonJS, sin tocar lógica) |
| 2 | El default sin `times` daba `∞` en vez de `5` | `Number(null) === 0`, así que la ausencia de `times` y `times=0` (infinito explícito) caían en la misma rama del condicional | Se distingue `timesParam === '0'` (string, explícito) de `timesParam === null` (ausente) antes de convertir a número |

Casos verificados con `curl` tras el fix, todos con resultado correcto:

1. `401 scope=data` → `/get/games` falla con 401 inyectado; `/auth/authenticate` no se ve afectado (llega a la API real).
2. `401 scope=auth` → `/auth/authenticate` falla con 401 inyectado; `/get/teams` responde 200 real.
3. `429 scope=data` → respuesta trae `Retry-After: 1` y `Access-Control-Expose-Headers: Retry-After`.
4. `500 scope=auth` → `/auth/authenticate` responde 500 inyectado.
5. `500` sin `times` → 5 peticiones consecutivas fallan, la 6ta ya llega a la API real (confirmado con status 404 real de `worldcup26.ir` sobre una ruta inexistente de prueba).
6. `/__chaos/off` → desactiva de inmediato, sin reiniciar ningún proceso.

Adicionalmente se verificó el preflight `OPTIONS` (responde `204` con los headers CORS correctos, reflejando el `Origin` real de la petición) y que `times=0` explícito sí produce `remaining: Infinity`.

## 8. Cómo probarlo manualmente (resumen — guía completa en `DEFENSA_CHAOS.md`)

```
Terminal 1: npm run dev
Terminal 2: node dev-proxy.cjs
```
Abrir `http://localhost:5173` y usar las URLs de `/__chaos/...` desde otra pestaña o `curl` para disparar cada caso mientras se interactúa con la app.
