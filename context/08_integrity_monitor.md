# 08_integrity_monitor.md

## Encabezado

**Propósito:** Definir qué hace el módulo Monitor de Integridad.

**Responsabilidad:** ¿Qué hace el módulo Monitor de Integridad?

**Tipo:** Vivo — se espera que acumule casos especiales descubiertos durante la implementación.

**Prioridad:** 6 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
03_business_rules.md
05_shared_infrastructure.md

Necesario para conocer:
- las reglas de resiliencia que gobiernan cada chequeo
- el Cliente HTTP y el envoltorio de timeout con AbortController ya existentes
```

**Alcance:** Objetivo, flujo, estados y casos especiales propios de este módulo. No define arquitectura, autenticación, ni el mecanismo interno de `AbortController`.

---

## 1. Objetivo

Practicar control de tiempos de espera en peticiones HTTP usando el envoltorio de `AbortController` compartido, mostrando el estado de salud de cada endpoint clave.

## 2. Endpoints Consumidos

`GET /get/teams`, `GET /get/groups`, `GET /get/games`, `GET /get/stadiums` (forma definida en `04_api_contract.md`).

## 3. Flujo

1. El módulo dispara un chequeo independiente para cada uno de los cuatro endpoints, usando el envoltorio de timeout compartido (`05_shared_infrastructure.md`) con un tiempo límite propio del módulo (por ejemplo, 5 segundos).
2. Muestra un indicador visual tipo semáforo por cada endpoint.
3. Si un chequeo supera el tiempo límite, ese endpoint se marca como "tiempo agotado" en vez de quedarse cargando indefinidamente.
4. Un botón permite volver a probar los cuatro endpoints de forma manual.

## 4. Estados del Módulo (por endpoint, independientes entre sí)

- **Verde:** el endpoint respondió correctamente dentro del tiempo límite.
- **Rojo / tiempo agotado:** el chequeo superó el tiempo límite y fue cancelado.
- **En verificación:** el chequeo está en curso.

## 5. Caso Especial: Reto de Resiliencia

Cada uno de los cuatro endpoints se evalúa de forma completamente independiente. Si tres responden correctamente y uno agota el tiempo límite:

- Solo ese indicador se marca en rojo.
- El estado de los otros tres no se ve afectado.
- Las mediciones ya completadas no se reinician por el fallo de un endpoint distinto.

## 6. Comportamiento Esperado

- Cada chequeo es una operación aislada; un timeout en un endpoint no cancela ni retrasa los demás.
- El botón de reintento manual vuelve a evaluar los cuatro endpoints desde cero, sin arrastrar el estado anterior de ninguno.
- El tiempo límite usado aquí es una configuración propia de este módulo sobre el envoltorio compartido, no una regla general del sistema.

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de JWT, 401, backoff, offline ni prohibiciones absolutas (vive en `03_business_rules.md`).
- El mecanismo interno del envoltorio de `AbortController` (vive en `05_shared_infrastructure.md`).
- La forma de los endpoints consumidos (vive en `04_api_contract.md`).
- Arquitectura general de la aplicación (vive en `02_architecture.md`).
- Diseño visual del semáforo o del panel (vive en los documentos de UX).
