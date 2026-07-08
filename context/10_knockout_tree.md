# 10_knockout_tree.md

## Encabezado

**Propósito:** Definir qué hace el módulo Árbol de Eliminatorias.

**Responsabilidad:** ¿Qué hace el módulo Árbol de Eliminatorias?

**Tipo:** Vivo — se espera que acumule casos especiales descubiertos durante la implementación.

**Prioridad:** 6 (según tabla de `00_assistant_contract.md`, sección 6).

**Dependencias:**
```
Depende de:
00_assistant_contract.md
03_business_rules.md
05_shared_infrastructure.md

Necesario para conocer:
- las reglas de resiliencia aplicables a la carga de partidos y equipos
- el Cliente HTTP y el Estado Global ya existentes
```

**Alcance:** Objetivo, flujo, estados y casos especiales propios de este módulo. No define arquitectura ni el Cliente HTTP.

---

## 1. Objetivo

Practicar la construcción de un layout jerárquico (bracket) con CSS Grid o Flexbox a partir de datos filtrados por tipo de fase.

## 2. Endpoints Consumidos

`GET /get/games`, `GET /get/teams` (forma definida en `04_api_contract.md`).

## 3. Flujo

1. El módulo obtiene partidos y equipos a través del Cliente HTTP compartido.
2. Filtra de `/get/games` los partidos cuyo campo `type` corresponda a fase eliminatoria (distinto de `"group"`).
3. Ordena los partidos filtrados por ronda y los renderiza como un bracket visual que conecta cada partido con el siguiente cruce correspondiente.
4. Cruza `home_team_id` y `away_team_id` contra `/get/teams` para mostrar nombres reales en lugar de identificadores.

## 4. Estados del Módulo

- **Bracket completo:** todas las rondas de fase eliminatoria tienen datos disponibles.
- **Bracket parcial:** algunas rondas ya tienen datos y otras aún no (torneo en fase de grupos) o fallaron después de un dibujo parcial.
- **Sin datos de fase eliminatoria:** el torneo sigue en fase de grupos, ninguna ronda eliminatoria tiene partidos aún.

## 5. Caso Especial: Reto de Resiliencia

- Si la fase eliminatoria todavía no tiene datos disponibles (el torneo sigue en fase de grupos), el bracket se renderiza igualmente, con las casillas vacías marcadas como "Por definir", en lugar de no mostrar nada.
- Si la petición falla después de que el bracket parcial ya se dibujó, las rondas ya resueltas se conservan tal como están, y solo las rondas pendientes de cruce se marcan en estado de error — el fallo posterior nunca borra el progreso ya renderizado.

## 6. Comportamiento Esperado

- El filtrado por `type !== "group"` se aplica siempre antes de intentar construir el bracket, para no mezclar partidos de fase de grupos con el árbol eliminatorio.
- El cruce de nombres reales contra `/get/teams` no bloquea el renderizado del bracket si ese cruce específico falla; en ese caso, se muestra el identificador o un marcador de "Por definir" en vez de detener todo el bracket.

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de JWT, 401, backoff, offline ni prohibiciones absolutas (vive en `03_business_rules.md`).
- Cómo funciona el Cliente HTTP ni el Estado Global (vive en `05_shared_infrastructure.md`).
- La forma de los endpoints consumidos (vive en `04_api_contract.md`).
- Arquitectura general de la aplicación (vive en `02_architecture.md`).
- Diseño visual del bracket (vive en los documentos de UX).
