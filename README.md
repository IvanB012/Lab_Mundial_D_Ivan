# CyberCup 26 — Dashboard Mundial 2026

Dashboard de herramientas técnicas y periodísticas para el Mundial 2026, construido para el laboratorio **ISW-521 (Programación en Ambiente Web I) — Categoría D**, Universidad Técnica Nacional.

El enunciado original pide un único módulo del catálogo D. Este proyecto, con aprobación del alcance, integra los cinco módulos de la categoría en un solo Dashboard con una misma base de resiliencia (JWT, backoff exponencial, manejo explícito de errores HTTP, modo offline) y una misma interfaz. Consume la API pública y real `https://worldcup26.ir` — no hay backend propio ni datos simulados en producción.

## Módulos

| Módulo | Qué hace |
|---|---|
| **Live Ticker** | Seguimiento casi en tiempo real de partidos vía polling, con notificaciones no bloqueantes ante cambios de marcador. |
| **Exportador de Reportes** | Genera una vista imprimible que cruza partidos, equipos y estadios. |
| **Monitor de Integridad** | Panel de salud de los endpoints de la API, con indicadores visuales por servicio. |
| **Buscador Bilingüe** | Alternancia inglés/farsi sobre datos de equipos y estadios ya renderizados, sin peticiones adicionales. |
| **Árbol de Eliminatorias** | Bracket visual de fase eliminatoria a partir de los partidos filtrados por tipo de fase. |

## Tecnologías

- **JavaScript vanilla** (sin frameworks de UI) + **Vite** como entorno de desarrollo y build.
- `fetch` con `async/await` exclusivo para toda comunicación con la API.
- `localStorage` para caché y modo offline; `AbortController` para control de timeouts.
- CSS moderno (Grid/Flexbox), incluyendo estilos `@media print` para el exportador de reportes.

Sin frameworks (React, Vue, etc.) ni librerías de UI: es un requisito explícito del laboratorio, no una elección de estilo.

## Estructura del proyecto

```
src/
  data/           Acceso a la API: cliente HTTP, auth JWT, backoff, timeouts, caché offline
  state/          Estado global de la aplicación (store) y bus de eventos entre módulos
  modules/        Los cinco módulos del catálogo, cada uno con su lógica, vista y estilos
  presentation/   Shell del dashboard: login, tabs, barra de estado, accesibilidad, toasts
context/          Sistema de documentación operativa del proyecto (ver nota abajo)
defense/          Notas de defensa técnica, roadmap y documentos de apoyo para la evaluación oral
tools/            Scripts de Node para el entorno de desarrollo (proxy y arranque conjunto)
```

## Instalación y ejecución

```bash
npm install
npm run dev
```

`npm run dev` levanta Vite (`:5173`) y, en paralelo, `tools/dev-proxy.cjs` (`:8000`) mediante `tools/dev-all.cjs`. El proxy existe porque `worldcup26.ir` tiene un bug real de CORS en `/auth/*` (no responde `Access-Control-Allow-Origin`); en desarrollo, Vite ya resuelve esto internamente vía su propio proxy (`vite.config.js`, ruta `/api`), así que el login funciona con solo `npm run dev`. `dev-proxy.cjs` se usa además como herramienta adicional para simular errores 401/429/500 de forma controlada durante la defensa oral (ver `defense/DEFENSA_CHAOS.md`), activándose vía variables de entorno opcionales que no afectan el comportamiento por defecto.

Otros scripts disponibles:

```bash
npm run build      # build de producción (vite build)
npm run preview    # sirve el build de producción
npm run dev:vite   # solo Vite, sin el proxy de desarrollo
npm run dev:proxy  # solo el proxy de desarrollo
```

## Sistema de contexto (`/context`)

El desarrollo de este proyecto (asistido por Claude Code) se apoya en un sistema de documentación modular en `/context`, que separa reglas de negocio, arquitectura, infraestructura compartida y comportamiento de cada módulo. Es documentación operativa del proceso de desarrollo, no parte de la aplicación en sí.

## Licencia

Proyecto académico desarrollado para el laboratorio ISW-521 (Categoría D) de la Universidad Técnica Nacional. No cuenta con una licencia de código abierto; su uso está pensado para fines de evaluación académica.
