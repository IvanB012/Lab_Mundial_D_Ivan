# 07_report_exporter.md

## Encabezado

**Propósito:** Definir qué hace el módulo Exportador de Reportes.

**Responsabilidad:** ¿Qué hace el módulo Exportador de Reportes?

**Tipo:** Vivo — se espera que acumule casos especiales descubiertos durante la implementación.

**Prioridad:** 6 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
03_business_rules.md
05_shared_infrastructure.md

Necesario para conocer:
- las reglas de resiliencia y offline que gobiernan la carga de los tres recursos
- el Cliente HTTP y el Estado Global ya existentes
```

**Alcance:** Objetivo, flujo, estados y casos especiales propios de este módulo. No define arquitectura, autenticación, ni el Cliente HTTP.

---

## 1. Objetivo

Practicar manipulación del DOM orientada a impresión, usando `@media print` para controlar el resultado final de un reporte que cruza partidos, equipos y estadios.

## 2. Endpoints Consumidos

`GET /get/games`, `GET /get/teams`, `GET /get/stadiums` (forma definida en `04_api_contract.md`).

## 3. Flujo

1. El módulo solicita los tres recursos a través del Cliente HTTP compartido.
2. Genera una vista de reporte que cruza partidos, equipos y estadios en una tabla o resumen legible.
3. Aplica reglas `@media print` que fuercen un layout en blanco y negro al imprimir, sin colores de fondo ni banderas a color.
4. Un botón "Exportar" dispara `window.print()` sobre la vista ya preparada.

## 4. Estados del Módulo

- **Reporte completo:** los tres recursos cargaron correctamente.
- **Reporte parcial:** uno o más recursos no cargaron; el reporte se genera igual con los datos disponibles.
- **Exportando:** el usuario disparó `window.print()`.

## 5. Caso Especial: Reto de Resiliencia

Si alguno de los tres recursos (partidos, equipos, estadios) no cargó:

- El botón de exportar sigue funcionando con los datos disponibles; nunca se bloquea la exportación completa por la falta de un recurso.
- El reporte impreso indica explícitamente qué sección no pudo completarse, en lugar de omitirla silenciosamente o dejarla vacía sin explicación.

## 6. Comportamiento Esperado

- La generación del reporte no espera a que los tres recursos respondan exitosamente antes de mostrar algo; se construye con lo que esté disponible.
- El layout de impresión nunca depende de color para transmitir información (coherente con la regla de blanco y negro).
- El botón "Exportar" está siempre disponible una vez que al menos un recurso cargó, incluso si los otros fallaron.

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de JWT, 401, backoff, offline ni prohibiciones absolutas (vive en `03_business_rules.md`).
- Cómo funciona el Cliente HTTP ni el Estado Global (vive en `05_shared_infrastructure.md`).
- La forma de los endpoints consumidos (vive en `04_api_contract.md`).
- Arquitectura general de la aplicación (vive en `02_architecture.md`).
- Diseño visual del reporte o estilos de impresión concretos (vive en los documentos de UX).
