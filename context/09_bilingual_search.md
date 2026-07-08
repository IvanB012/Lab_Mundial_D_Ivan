# 09_bilingual_search.md

## Encabezado

**Propósito:** Definir qué hace el módulo Buscador Bilingüe.

**Responsabilidad:** ¿Qué hace el módulo Buscador Bilingüe?

**Tipo:** Vivo — se espera que acumule casos especiales descubiertos durante la implementación.

**Prioridad:** 6 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
03_business_rules.md
05_shared_infrastructure.md

Necesario para conocer:
- las reglas de resiliencia aplicables a la carga inicial de datos
- el Cliente HTTP y el Estado Global ya existentes
```

**Alcance:** Objetivo, flujo, estados y casos especiales propios de este módulo. No define arquitectura ni el Cliente HTTP.

---

## 1. Objetivo

Practicar manipulación masiva del DOM ya renderizado, sin depender de nuevas peticiones a la API una vez cargados los datos iniciales.

## 2. Endpoints Consumidos

`GET /get/teams`, `GET /get/stadiums` (forma definida en `04_api_contract.md`).

## 3. Flujo

1. En la primera carga, el módulo obtiene los datos de equipos y estadios a través del Cliente HTTP compartido y los cachea en memoria, incluyendo ambos idiomas (`name_en`, `name_fa`).
2. Un switch global (un solo control) recorre todo el DOM renderizado y alterna entre los campos `name_en` y `name_fa` de equipos y estadios.
3. El switch nunca vuelve a pedir datos a la API — opera exclusivamente sobre la caché en memoria ya cargada.

## 4. Estados del Módulo

- **Cargando datos iniciales:** primera petición a los dos endpoints en curso.
- **Listo (idioma inglés):** datos cacheados en memoria, mostrando `name_en`.
- **Listo (idioma farsi):** datos cacheados en memoria, mostrando `name_fa`.

## 5. Caso Especial: Reto de Resiliencia

Si el usuario cambia el idioma mientras una petición inicial todavía está en curso:

- El switch no debe romperse ni mostrar campos `undefined`.
- El idioma elegido se aplica en cuanto los datos lleguen, respetando el último valor del switch en el momento en que la petición se resuelve — no el valor que estaba activo cuando la petición se inició.

## 6. Comportamiento Esperado

- Una vez cargados los datos, ningún cambio de idioma dispara una nueva petición de red.
- El estado del switch se lee en el momento de aplicar los datos, no en el momento de solicitarlos, para evitar aplicar un idioma obsoleto.

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de JWT, 401, backoff, offline ni prohibiciones absolutas (vive en `03_business_rules.md`).
- Cómo funciona el Cliente HTTP ni el Estado Global (vive en `05_shared_infrastructure.md`).
- La forma de los endpoints consumidos (vive en `04_api_contract.md`).
- Arquitectura general de la aplicación (vive en `02_architecture.md`).
- Diseño visual del switch o del buscador (vive en los documentos de UX).
