# layout.md

## Encabezado

**Propósito:** Definir cómo se distribuyen los elementos en pantalla, con medidas concretas.

**Responsabilidad:** ¿Cómo se distribuyen los elementos en pantalla?

**Tipo:** Estático — las medidas base no cambian salvo un problema real de usabilidad detectado durante la implementación.

**Prioridad:** 7 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
dashboard_design.md

Necesario para conocer:
- las zonas principales (Barra de Estado Global, Barra de Pestañas, Zona de Contenido) que este documento dimensiona
```

**Alcance:** Medidas, proporciones y comportamiento responsive de las zonas ya definidas en `dashboard_design.md`. No define colores, tipografía, ni el patrón de navegación en sí (eso ya está fijado en `dashboard_design.md`).

---

## 1. Estructura Vertical (Escritorio, ≥1024px)

```
┌─────────────────────────────────────────────┐
│ Barra de Estado Global — 48px de alto        │
├─────────────────────────────────────────────┤
│ Barra de Pestañas — 56px de alto             │
├─────────────────────────────────────────────┤
│                                               │
│ Zona de Contenido — alto restante            │
│ (mínimo 500px, con scroll interno si el      │
│ contenido del módulo lo requiere)            │
│                                               │
└─────────────────────────────────────────────┘
```

- Ancho máximo del contenido: 1280px, centrado, con márgenes laterales fluidos en pantallas más anchas.
- Márgenes internos estándar: 24px entre la Zona de Contenido y sus bordes.

## 2. Barra de Estado Global

- Distribuida en tres secciones horizontales de ancho flexible: Sesión (izquierda), Countdown de backoff (centro, solo visible cuando hay un backoff activo), Indicador offline (derecha, solo visible cuando aplica).
- Cuando no hay countdown ni modo offline activos, esas secciones no ocupan espacio — la barra se colapsa a solo mostrar el estado de sesión.

## 3. Barra de Pestañas

- Cinco pestañas de ancho igual repartido (`1fr` cada una) en escritorio.
- Altura fija de 56px, con el texto del módulo centrado vertical y horizontalmente.
- La pestaña activa se distingue por un borde inferior de 3px (el color específico se define en `design_system.md`).

## 4. Zona de Contenido

- Cada módulo define su propio layout interno dentro de esta zona (por ejemplo, el grid del bracket o la tabla del exportador), pero siempre respeta el margen de 24px y el ancho máximo de 1280px heredados de esta zona.
- La Zona de Contenido nunca reduce su alto por debajo de 500px; si el contenido del módulo es más alto, se activa scroll interno en vez de comprimir la zona.

## 5. Comportamiento Responsive

- **Escritorio (≥1024px):** estructura descrita en la sección 1, pestañas en fila completa.
- **Tablet (768px–1023px):** misma estructura vertical; las pestañas reducen su padding interno pero se mantienen en una sola fila.
- **Móvil (<768px):** la Barra de Pestañas se convierte en una fila con scroll horizontal (las cinco pestañas no se apilan verticalmente, para mantener el patrón de navegación ya definido); la Barra de Estado Global reduce sus tres secciones a iconos con texto abreviado si el ancho no alcanza para el texto completo.

## 6. Grid Base para Contenido de Módulos

Cuando un módulo necesita organizar múltiples elementos (por ejemplo, tarjetas o indicadores), usa como base un grid de 12 columnas con separación (`gap`) de 16px. Cada módulo decide cuántas columnas ocupa cada elemento según su propio contenido — esta sección solo fija la unidad base compartida, no el layout específico de ningún módulo.

---

## Lo que este documento NO cubre

Este documento NO define:

- El patrón de navegación en sí ni qué muestra cada zona (vive en `dashboard_design.md`).
- Colores, tipografía ni estilos visuales (vive en `design_system.md`).
- Layout interno específico de ningún módulo más allá del grid base compartido (vive en el documento de cada módulo).
- Reglas de negocio ni resiliencia.
