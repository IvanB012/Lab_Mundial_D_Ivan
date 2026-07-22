# design_system.md

## Encabezado

**Propósito:** Definir qué estilos y componentes visuales se reutilizan a lo largo del Dashboard.

**Responsabilidad:** ¿Qué estilos y componentes visuales se reutilizan?

**Tipo:** Estático — la base visual no cambia salvo un problema real de consistencia detectado durante la implementación.

**Prioridad:** 7 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
dashboard_design.md
layout.md

Necesario para conocer:
- las zonas y medidas que estos estilos deben vestir
```

**Alcance:** Colores, tipografía y componentes visuales reutilizables. No define estructura de navegación (`dashboard_design.md`) ni medidas de layout (`layout.md`); este documento solo define su apariencia.

---

## 1. Paleta de Color Semántica

El color se usa con significado funcional, no decorativo, coherente con la naturaleza de resiliencia del proyecto:

| Uso | Color | Significado |
|---|---|---|
| Estado normal / activo | Azul | Operación correcta, elemento seleccionado |
| Advertencia | Ámbar | Backoff en curso, countdown activo, dato cacheado (offline) |
| Éxito | Verde | Endpoint saludable, chequeo superado |
| Error | Rojo | Endpoint caído, timeout, sesión expirada |
| Neutral | Gris | Elementos inactivos, texto secundario |

Los valores hexadecimales exactos se fijan al implementar (no forman parte de este documento como valores cerrados), pero todo color nuevo que se agregue debe encajar en una de estas cinco categorías semánticas; no se introducen colores decorativos sin significado funcional.

## 2. Tipografía

- Una única familia tipográfica sans-serif para toda la aplicación, sin mezclar fuentes por módulo.
- Jerarquía de tres niveles: título de módulo (mayor peso y tamaño), texto de contenido (peso regular), texto secundario/anotaciones (tamaño reducido, color gris neutral).
- El mismo nivel de jerarquía se ve igual en todos los módulos — un "título de módulo" en Live Ticker debe usar el mismo tamaño y peso que en Monitor de Integridad.

## 3. Componentes Reutilizables

- **Toast.** Notificación no bloqueante, usa el color semántico correspondiente al tipo de evento (ámbar para pausas de backoff, verde para actualizaciones exitosas, rojo para errores). Mismo componente para los cinco módulos — ningún módulo define su propio estilo de toast.
- **Indicador tipo semáforo.** Círculo o punto de color (verde/ámbar/rojo) usado por el Monitor de Integridad, pero definido aquí como componente reutilizable por si otro módulo necesita representar un estado de salud similar.
- **Badge de estado.** Etiqueta pequeña con fondo de color semántico y texto corto (por ejemplo, "Por definir", "Tiempo agotado", "Offline"), reutilizada por el Bracket de Eliminatorias, el Monitor de Integridad y cualquier módulo que necesite marcar un estado puntual.
- **Botón primario / secundario.** Un único estilo de botón primario (para acciones principales como "Exportar" o "Reintentar") y uno secundario (para acciones de menor jerarquía), compartidos por todos los módulos.
- **Botón Flotante de Accesibilidad (Fase 8).** Componente único, montado una sola vez, con tres funciones:
  - *Alto contraste:* invierte la paleta a fondo negro puro y texto blanco/colores muy saturados, eliminando adornos visuales no esenciales. Reutiliza las mismas variables de color semántico ya definidas (sección 1), sobreescritas bajo un modificador global (por ejemplo `[data-contrast="high"]`), sin duplicar la lógica de color por componente.
  - *Tamaño de letra ajustable:* botones `+`/`-` que escalan la tipografía en pasos fijos (ej. 100% → 110% → 120%), con un tope máximo definido para no romper el layout, y el porcentaje actual visible junto a los controles. El layout de las tres zonas de `layout.md` debe reacomodarse automáticamente al cambio (unidades relativas, no píxeles fijos).
  - *Navegación y avisos accesibles:* orden de tabulación natural (de arriba hacia abajo, siguiendo el orden real del DOM) en las cinco pestañas y sus contenidos; los elementos de contenido dinámico (toasts, countdown, mensajes de sesión) usan `aria-live="polite"` para que lectores de pantalla anuncien su aparición sin intervención del usuario.

## 4. Principio de Reutilización

Ningún módulo debe crear una variante visual propia de estos componentes. Si un módulo necesita algo que un componente existente no cubre, esto se señala como un vacío del sistema de diseño, no se resuelve con un estilo aislado dentro del módulo.

---

## Lo que este documento NO cubre

Este documento NO define:

- Estructura de navegación ni zonas del Dashboard (vive en `dashboard_design.md`).
- Medidas, breakpoints ni comportamiento responsive (vive en `layout.md`).
- Comportamiento funcional de ningún componente (por ejemplo, cuándo aparece un toast — eso vive en `05_shared_infrastructure.md` y en el documento de cada módulo).
- Reglas de negocio ni resiliencia.