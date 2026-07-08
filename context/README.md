# README.md — Mapa del Sistema de Contexto

## Encabezado

**Propósito:** Servir como punto de entrada y mapa de navegación del sistema documental `/context`.

**Responsabilidad:** ¿Qué documentos existen en el sistema, qué pregunta responde cada uno, y quién es el propietario de cada concepto?

**Tipo:** Vivo — este documento se actualiza cada vez que se agrega, fusiona o redefine un documento del sistema.

**Prioridad:** No participa en la jerarquía de prioridad de contenido (ver `00_assistant_contract.md`, sección 6). Es un índice, no una fuente de reglas.

**Dependencias:** Ninguna dependencia de contenido. Su contenido depende, en la práctica, de que cada documento listado exista y declare su propia responsabilidad y propietarios.

**Alcance:** Navegación del sistema documental. No define reglas, arquitectura, ni comportamiento.

**Orden de carga:** Consulta puntual. No forma parte de la carga obligatoria de una tarea de implementación ya delimitada. Se carga cuando es necesario localizar información o comprender la organización general del sistema.

---

## 1. Índice de Documentos

### Core

| Documento | Pregunta que responde | Estado |
|---|---|---|
| `00_assistant_contract.md` | ¿Cómo debe comportarse Claude durante todo el proyecto? | ✅ Aprobado |
| `01_project_overview.md` | ¿Qué proyecto estamos construyendo? | ✅ Aprobado |
| `02_architecture.md` | ¿Cómo está organizada la aplicación? | ✅ Aprobado |
| `03_business_rules.md` (resiliencia y restricciones) | ¿Cuáles son las reglas obligatorias del proyecto? | ✅ Aprobado |
| `04_api_contract.md` | ¿Cómo debe comunicarse la aplicación con la API? | ✅ Aprobado |
| `05_shared_infrastructure.md` | ¿Qué componentes reutilizables existen antes de construir cualquier módulo? | ✅ Aprobado |

### Modules

| Documento | Pregunta que responde | Estado |
|---|---|---|
| `06_live_ticker.md` | ¿Qué hace el módulo Live Ticker? | ✅ Aprobado |
| `07_report_exporter.md` | ¿Qué hace el módulo Exportador de Reportes? | ✅ Aprobado |
| `08_integrity_monitor.md` | ¿Qué hace el módulo Monitor de Integridad? | ✅ Aprobado |
| `09_bilingual_search.md` | ¿Qué hace el módulo Buscador Bilingüe? | ✅ Aprobado |
| `10_knockout_tree.md` | ¿Qué hace el módulo Árbol de Eliminatorias? | ✅ Aprobado |

### UX

| Documento | Pregunta que responde | Estado |
|---|---|---|
| `dashboard_design.md` | ¿Cómo se ve el Dashboard en conjunto? | ✅ Aprobado |
| `layout.md` | ¿Cómo se distribuyen los elementos en pantalla? | ✅ Aprobado |
| `design_system.md` | ¿Qué estilos y componentes visuales se reutilizan? | ✅ Aprobado |

### Fuera de `/context`

| Ubicación | Contenido | Motivo |
|---|---|---|
| `/project` | Rúbrica de defensa oral, preguntas teóricas típicas, qué debe reproducirse en DevTools | No es contexto operativo para implementar; es material de preparación del estudiante para la defensa. |

---

## 2. Dueño Único por Concepto

Esta tabla se completa progresivamente a medida que cada documento se redacta y declara formalmente su propiedad sobre los conceptos que introduce. Mientras un concepto no tenga documento propietario aprobado, no debe usarse como si ya tuviera una fuente fija.

| Concepto | Documento propietario | Estado |
|---|---|---|
| Flujo de trabajo del asistente | `00_assistant_contract.md` | ✅ Definido |
| Principios arquitectónicos | `00_assistant_contract.md` | ✅ Definido |
| Prioridad en caso de conflicto | `00_assistant_contract.md` | ✅ Definido |
| JWT / autenticación | `03_business_rules.md` | ✅ Definido |
| Manejo de 401 | `03_business_rules.md` | ✅ Definido |
| Backoff exponencial (429 / 500) | `03_business_rules.md` | ✅ Definido |
| Modo offline / localStorage | `03_business_rules.md` | ✅ Definido |
| Prohibiciones absolutas | `03_business_rules.md` | ✅ Definido |
| `async/await` exclusivo | `03_business_rules.md` | ✅ Definido |
| Endpoints y forma de la API | `04_api_contract.md` | ✅ Definido |
| Cliente HTTP compartido | `05_shared_infrastructure.md` | ✅ Definido |
| Estado global | `05_shared_infrastructure.md` | ✅ Definido |
| Gestor de caché | `05_shared_infrastructure.md` | ✅ Definido |
| Sistema de notificaciones (toasts) | `05_shared_infrastructure.md` | ✅ Definido |
| AbortController (envoltorio de timeout) | `05_shared_infrastructure.md` | ✅ Definido |

---

## 3. Cómo Interpretar Este Mapa

- Un concepto solo puede tener un documento propietario. Si aparece mencionado en otro documento, debe ser solo una referencia por nombre, nunca una nueva definición.
- Si un concepto necesario para una tarea no aparece en esta tabla, no existe todavía como fuente única en el sistema — debe señalarse como vacío, no asumirse.
- Este mapa no arbitra conflictos de contenido; eso lo resuelve la tabla de prioridad en `00_assistant_contract.md`.

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de comportamiento del asistente (vive en `00_assistant_contract.md`).
- Definiciones completas de ningún concepto (solo indica su propietario).
- Arbitraje de conflictos de contenido.
- Contenido del laboratorio, arquitectura, módulos o UX.