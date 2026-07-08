# 01_project_overview.md

## Encabezado

**Propósito:** Dar una visión general de qué proyecto se está construyendo, sin entrar en reglas, arquitectura ni implementación.

**Responsabilidad:** ¿Qué proyecto estamos construyendo?

**Tipo:** Estático — el alcance del proyecto no cambia salvo decisión explícita del estudiante.

**Prioridad:** 3 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md

Necesario para conocer:
- cómo debe consultarse este documento dentro del flujo de trabajo
```

**Alcance:** Visión general del proyecto. No define arquitectura, reglas técnicas obligatorias, ni contrato de API.

---

## 1. Objetivo General

Construir un Dashboard de herramientas técnicas y periodísticas para el Mundial 2026, que consume la API pública `https://worldcup26.ir`. El Dashboard integra los módulos necesarios para cubrir las distintas utilidades del catálogo de la Categoría D del laboratorio ISW-521 (Live Ticker, Exportador de Reportes, Monitor de Integridad, Buscador Bilingüe y Árbol de Eliminatorias), unificados bajo una misma base de resiliencia y una misma interfaz.

## 2. Alcance

- El Dashboard cubre los cinco módulos del catálogo, cada uno con responsabilidad propia y aislada.
- El proyecto está construido en JavaScript (Vite + Vanilla JS), sin frameworks.
- El desarrollo asistido por Claude Code se apoya en un sistema de contexto modular (`/context`) que separa reglas, arquitectura, infraestructura compartida y comportamiento de cada módulo.
- Nota de alcance académico: el enunciado original del laboratorio (modalidad individual) exige la entrega de un único subproyecto elegido del catálogo. Este proyecto integra los cinco módulos en un único Dashboard. Los detalles del alcance académico se documentan en el enunciado original
## 3. Resumen del Laboratorio de Origen

El proyecto nace del laboratorio ISW-521, Categoría D: Herramientas Técnicas y Periodísticas. El laboratorio exige una aplicación JavaScript interactiva con manipulación avanzada del DOM, consumo de una API REST real mediante Fetch, y una arquitectura de resiliencia obligatoria (autenticación JWT, manejo explícito de errores HTTP, backoff exponencial, y modo offline). La evaluación se compone de dos partes: cumplimiento del proyecto y defensa técnica oral en vivo. El detalle completo de las reglas obligatorias no vive en este documento — vive en el documento de reglas de negocio (`03_business_rules.md`).

## 4. Propósito del Dashboard

El Dashboard existe para demostrar, de forma unificada, dominio de:

- Consumo resiliente de una API real bajo condiciones de fallo (errores 401, 429, 500).
- Manipulación del DOM sin frameworks, con separación clara entre lógica de datos y presentación.
- Control preciso del ciclo de vida de peticiones asíncronas (temporización, cancelación, reintentos).
- Capacidad de explicar y defender cualquier decisión técnica del código entregado.

## 5. Tecnologías Obligatorias

- JavaScript (Vanilla JS), sin frameworks de UI.
- Vite como entorno de desarrollo y build.
- Fetch API con `async/await` exclusivo.
- `localStorage` para modo offline.
- `AbortController` donde aplique control de tiempo de espera.
- CSS moderno (Grid/Flexbox) para maquetación, incluyendo `@media print` donde el módulo lo requiera.

El detalle normativo de cómo debe usarse cada una de estas tecnologías (qué está prohibido, qué es obligatorio en cada llamada) no vive aquí — vive en `03_business_rules.md`.

## 6. Descripción General de los Módulos

- **Live Ticker:** seguimiento en tiempo casi real de partidos mediante polling, con notificaciones no bloqueantes ante cambios de marcador.
- **Exportador de Reportes:** generación de una vista imprimible que cruza partidos, equipos y estadios.
- **Monitor de Integridad:** panel de salud de los distintos endpoints de la API, con indicadores visuales por servicio.
- **Buscador Bilingüe:** alternancia de idioma (inglés/farsi) sobre datos de equipos y estadios ya renderizados, sin nuevas peticiones.
- **Árbol de Eliminatorias:** construcción visual de un bracket de fase eliminatoria a partir de los partidos filtrados por tipo de fase.

La responsabilidad detallada, flujo y casos especiales de cada módulo no viven aquí — cada uno tiene su propio documento (`06` a `10`).

---

## Lo que este documento NO cubre

Este documento NO define:

- Arquitectura de la aplicación ni sus capas.
- Reglas obligatorias, restricciones o prohibiciones absolutas.
- Endpoints, métodos HTTP ni contrato de la API.
- Infraestructura compartida (cliente HTTP, estado global, caché).
- Comportamiento detallado de ningún módulo.
- Diseño visual o UX.
