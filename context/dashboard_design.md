# dashboard_design.md

## Encabezado

**Propósito:** Definir cómo se ve el Dashboard en conjunto, a partir del wireframe aprobado.

**Responsabilidad:** ¿Cómo se ve el Dashboard en conjunto?

**Tipo:** Estático — la estructura visual general no cambia salvo un problema real detectado durante la implementación.

**Prioridad:** 7 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
02_architecture.md
05_shared_infrastructure.md

Necesario para conocer:
- las capas que este diseño debe respetar (Presentación consume Módulos, nunca al revés)
- el Sistema de Notificaciones y el Estado Global que alimentan la barra de estado global
```

**Alcance:** Estructura visual general del Dashboard: navegación y zonas principales. No define medidas exactas de layout (vive en `layout.md`) ni estilos, colores o tipografía (vive en `design_system.md`).

**Referencia de origen:** Este diseño está basado en el Wireframe B (navegación por pestañas horizontales), aprobado durante la fase de diseño de UX.

---

## 1. Patrón de Navegación

El Dashboard usa **navegación por pestañas horizontales**. Existen cinco pestañas, una por módulo:

```
Live Ticker | Exportador de Reportes | Monitor de Integridad | Buscador Bilingüe | Árbol de Eliminatorias
```

Solo un módulo está activo (visible) a la vez. Cambiar de pestaña reemplaza el contenido debajo, sin recargar la página ni afectar a los demás módulos en segundo plano (por ejemplo, el polling del Live Ticker sigue corriendo aunque su pestaña no esté activa, según lo definido en `06_live_ticker.md`).

## 2. Zonas Principales

El Dashboard se divide en dos franjas fijas y una zona de contenido:

1. **Barra de Estado Global** (franja superior, siempre visible): muestra el estado de sesión (JWT), el countdown activo si hay un backoff por 429 en curso, y el indicador de modo offline si algún módulo está mostrando datos cacheados. Es una única franja transversal — no se repite por módulo.
2. **Barra de Pestañas** (debajo de la barra de estado): los cinco módulos como pestañas seleccionables.
3. **Zona de Contenido** (el resto de la pantalla): muestra la vista completa del módulo activo.

## 3. Relación con la Arquitectura

La Barra de Estado Global se alimenta del Sistema de Notificaciones y del Estado Global definidos en `05_shared_infrastructure.md` — no consulta directamente a ningún módulo ni al Cliente HTTP. Cada módulo, a su vez, es responsable de notificar al Estado Global cuando su condición afecta el estado mostrado ahí (por ejemplo, un módulo que entra en modo offline).

## 4. Reglas de Coherencia entre Módulos

- Ningún módulo puede introducir una segunda barra de estado propia — el estado de sesión, countdown y offline se muestra únicamente en la Barra de Estado Global.
- El cambio de pestaña nunca cancela procesos en curso de otros módulos (polling, chequeos, cachés en memoria); solo cambia qué se muestra.
- Todas las notificaciones tipo toast, sin importar de qué módulo provengan, aparecen en la misma zona de la pantalla, gestionadas por el Sistema de Notificaciones compartido.

## 5. Persistencia de la Pestaña Activa (Fase 8)

La última pestaña visitada se guarda en `localStorage`. Al recargar la página, el Dashboard restaura esa pestaña como activa en vez de volver siempre a la primera. Esto no afecta la carga de datos de los demás módulos: como los 5 paneles ya se montan simultáneamente desde Fase 2 (alternando `hidden`, sin destruir/recrear), todos siguen cargando sus datos en paralelo desde el arranque, sin importar cuál quede visible primero.

## 6. Botón Flotante de Accesibilidad (Fase 8)

Elemento fijo, superpuesto sobre el resto de la interfaz (no forma parte de ninguna de las tres zonas principales de la sección 2), visible en las cinco pestañas por igual. Expone controles de alto contraste y tamaño de letra ajustable; su comportamiento detallado y estilo visual se definen en `design_system.md`.

Este documento NO define:

- Medidas exactas, breakpoints ni comportamiento responsive (vive en `layout.md`).
- Colores, tipografía ni componentes visuales reutilizables (vive en `design_system.md`).
- Comportamiento interno de cada módulo (vive en `06`–`10`).
- Reglas de negocio ni resiliencia (vive en `03_business_rules.md`).