# 02_architecture.md

## Encabezado

**Propósito:** Definir cómo está organizada la aplicación a nivel de capas y cómo fluye la información entre ellas.

**Responsabilidad:** ¿Cómo está organizada la aplicación?

**Tipo:** Estático — la organización en capas no cambia salvo un problema estructural real durante la implementación.

**Prioridad:** 3 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
01_project_overview.md

Necesario para conocer:
- qué proyecto se está organizando
```

**Alcance:** Relación y flujo entre capas de la aplicación. No describe endpoints, reglas HTTP, componentes concretos, módulos ni diseño visual.

**Criterio de separación con `05_shared_infrastructure.md`:** este documento describe **relaciones y dirección de flujo entre partes** (el plano). `05_shared_infrastructure.md` describe **la existencia y responsabilidad de cada pieza aislada** (el inventario). Si una frase describe cómo una parte se comunica con otra, pertenece aquí. Si describe qué es una pieza y para qué sirve por sí sola, pertenece a `05`.

---

## 1. Capas de la Aplicación

La aplicación se organiza en cuatro capas, cada una con una única dirección de dependencia hacia la capa inferior:

1. **Capa de Datos.** Responsable de obtener información desde la API externa y desde la caché local. Es la única capa autorizada a iniciar peticiones de red.
2. **Capa de Estado.** Recibe los datos ya resueltos por la Capa de Datos y mantiene la representación en memoria que los módulos consultan. No conoce detalles de red ni de DOM.
3. **Capa de Módulos (lógica de dominio por módulo).** Cada módulo (Live Ticker, Exportador de Reportes, etc.) consume el Estado y decide qué debe representarse, sin acceder directamente a la Capa de Datos.
4. **Capa de Presentación.** Traduce las decisiones de cada módulo en manipulación real del DOM. No contiene lógica de negocio ni de red.

## 2. Dirección del Flujo

El flujo de información es unidireccional:

```
Capa de Datos → Capa de Estado → Capa de Módulos → Capa de Presentación
```

Ningún módulo accede directamente a la Capa de Datos; siempre pasa por la Capa de Estado. Esto evita que un módulo dependa de detalles de red que no le corresponden.

La comunicación en sentido inverso (por ejemplo, una acción del usuario en la Capa de Presentación que debe disparar una nueva petición) ocurre mediante eventos: la Capa de Presentación notifica una intención, el módulo correspondiente decide si eso requiere datos nuevos, y si es así, delega en la Capa de Estado, que a su vez delega en la Capa de Datos.

## 3. Comunicación Entre Componentes

- La Capa de Datos entrega resultados a la Capa de Estado de forma asíncrona; la Capa de Estado no bloquea la interfaz mientras espera.
- La Capa de Estado notifica a los módulos suscritos cuando su información relevante cambia, en lugar de que cada módulo consulte activamente en cada ciclo.
- Cada módulo es responsable de traducir cambios de estado en instrucciones de presentación; la Capa de Presentación nunca decide por sí sola qué mostrar, solo ejecuta lo que el módulo le indica.
- Los módulos no se comunican entre sí directamente. Si dos módulos necesitan compartir información (por ejemplo, datos de equipos usados tanto por el Buscador Bilingüe como por el Árbol de Eliminatorias), ambos consultan la misma Capa de Estado, nunca se referencian mutuamente.

## 4. Responsabilidades de Alto Nivel

| Capa | Responsabilidad | No responsable de |
|---|---|---|
| Datos | Obtener información externa y cacheada | Decidir qué se muestra |
| Estado | Mantener y notificar la información vigente | Red, DOM |
| Módulos | Lógica de dominio de cada herramienta | Red, manipulación directa del DOM |
| Presentación | Reflejar en el DOM lo que el módulo decide | Lógica de negocio, red |

Esta tabla es un resumen de alto nivel; la responsabilidad detallada de cada pieza concreta dentro de la Capa de Datos y la Capa de Estado (cliente HTTP, gestor de caché, sistema de eventos) vive en `05_shared_infrastructure.md`.

---

## Lo que este documento NO cubre

Este documento NO define:

- Endpoints ni contrato de la API.
- Reglas HTTP, códigos de error ni políticas de reintento.
- Qué componentes concretos existen dentro de cada capa (vive en `05_shared_infrastructure.md`).
- Comportamiento específico de ningún módulo.
- CSS, HTML o diseño visual.
