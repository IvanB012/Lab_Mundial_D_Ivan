# 00_assistant_contract.md

## Encabezado

**Propósito:** Definir cómo debe comportarse Claude Code durante todo el desarrollo del proyecto.

**Responsabilidad:** ¿Cómo debe comportarse Claude durante todo el proyecto?

**Tipo:** Estático — este documento no debe modificarse salvo que aparezca un problema real durante la implementación.

**Prioridad:** Máxima. Ningún otro documento del sistema puede contradecir lo establecido aquí sobre comportamiento del asistente, principios arquitectónicos o arbitraje de conflictos.

**Dependencias:** Ninguna. Es el documento raíz del sistema.

**Alcance:** Comportamiento del asistente. No cubre reglas de negocio, arquitectura, API, ni módulos.

---

## 1. Principios Arquitectónicos

Estos cinco principios gobiernan cómo Claude debe razonar frente al sistema documental completo, no solo frente a este documento.

1. **Single Source of Truth.** Cada concepto tiene un único documento propietario. Si el mismo concepto parece estar definido en más de un lugar, esto es una inconsistencia del sistema, no una fuente válida adicional — debe señalarse, nunca combinarse silenciosamente.

2. **Responsabilidad Única.** Cada documento responde exactamente una pregunta. Si al redactar o modificar contenido del sistema documental parece necesario responder una segunda pregunta dentro del mismo documento, eso es una señal de que el contenido pertenece a otro lugar.

3. **No asumir información no documentada.** Si un dato necesario para una tarea no aparece en ningún documento cargado, no se inventa ni se completa por inferencia silenciosa. Se señala explícitamente como información faltante o se pregunta.

4. **Explicar antes de implementar.** Toda decisión de diseño no evidente debe poder justificarse señalando el documento y la regla que la origina. El código no se escribe por intuición cuando existe una regla documentada que debería gobernarlo.

5. **Validar antes de cerrar una tarea.** Ninguna tarea se considera terminada solo porque el código corre. Se valida contra las reglas del documento correspondiente antes de darla por cerrada.

---

## 2. Flujo Obligatorio de Trabajo

Antes de escribir código para cualquier tarea, Claude debe seguir esta secuencia:

1. **Identificar la responsabilidad de la tarea.** ¿Qué módulo o componente se va a construir o modificar?
2. **Determinar qué documentos son necesarios**, según lo que cada documento declare en su propia sección de Dependencias. Si no es evidente qué documentos aplican, consultar el mapa del sistema (`README.md` de `/context`) en lugar de asumir.
3. **Cargar únicamente esos documentos.** No cargar la carpeta completa por defecto.
4. **Verificar si existe conflicto aparente entre los documentos cargados.** Si lo hay, resolver según la tabla de prioridad de la sección 5 de este documento.
5. **Implementar** siguiendo estrictamente las reglas de los documentos cargados.
6. **Validar el resultado** contra la sección "Qué debe contener" del documento relevante, antes de considerar la tarea cerrada.

Este flujo aplica a toda tarea de implementación, sin excepción.

---

## 3. Cuándo Preguntar vs. Cuándo Proceder

- Si la tarea está completamente cubierta por los documentos cargados, Claude procede sin preguntar.
- Si existe una ambigüedad menor que puede resolverse con una asunción razonable y declarada explícitamente en el resultado, Claude puede proceder, dejando constancia de la asunción tomada.
- Si la ambigüedad afecta una regla obligatoria (por ejemplo, resiliencia, autenticación, o una prohibición absoluta) y no hay forma de resolverla razonablemente con lo documentado, Claude debe detenerse y preguntar antes de continuar.
- Claude nunca asume silenciosamente sobre restricciones obligatorias del proyecto. La ambigüedad en una prohibición o regla crítica siempre se pregunta; la ambigüedad en un detalle menor de implementación puede resolverse y declararse.

---

## 4. Cómo Justificar Decisiones

Toda decisión de diseño que no sea trivial debe ir acompañada de una referencia explícita al documento y regla que la origina (por ejemplo: "según 03_resilience_protocol, sección de backoff"). Si una decisión no puede justificarse señalando una fuente documentada, esto indica que la información falta en el sistema de contexto y debe señalarse como vacío, no resolverse por criterio propio no declarado.

Esto es especialmente relevante porque el estudiante debe poder defender ante el profesor cualquier código entregado, incluido el generado con apoyo de IA. Un código que Claude no puede justificar con una fuente documentada es, por definición, un código que el estudiante tampoco podrá defender con criterio propio.

---

## 5. Código Explicable

Claude debe priorizar código que pueda explicarse con claridad sobre código compacto pero opaco. Esto significa:

- Preferir soluciones legibles y directas frente a abstracciones innecesarias que dificulten la explicación línea por línea.
- Evitar patrones o trucos de lenguaje que funcionen correctamente pero cuya lógica interna sea difícil de justificar verbalmente.
- Cuando exista más de una forma válida de resolver algo, preferir la que el estudiante podría explicar con mayor seguridad frente a preguntas de seguimiento.

Este documento no define qué debe demostrarse en la defensa oral ni qué preguntas puede hacer el profesor — esa información vive fuera de `/context`. Esta sección solo establece cómo debe escribirse el código para que sea defendible, no qué se evalúa en la defensa.

---

## 6. Prioridad en Caso de Conflicto

Si dos documentos cargados se contradicen, se resuelve según este orden (mayor a menor autoridad):

1. `00_assistant_contract.md`
2. Documento de reglas de negocio (resiliencia y restricciones obligatorias del laboratorio)
3. Documento de arquitectura
4. Documento de contrato de API
5. Documento de infraestructura compartida
6. Documentos de módulo
7. Documentos de UX

Un documento de menor prioridad nunca puede contradecir a uno de mayor prioridad. Si esto ocurre, se asume que el documento de menor prioridad contiene un error y debe señalarse, no aplicarse.

Esta tabla resuelve **contradicciones de contenido**. No determina qué documentos cargar ni en qué orden leerlos — esas son decisiones distintas que corresponden al flujo de la sección 2 y a las Dependencias declaradas por cada documento respectivamente.

---

## 7. Validación Antes de Cerrar una Tarea

Antes de dar una tarea por terminada, Claude debe verificar:

- Que el resultado cumple todas las reglas obligatorias aplicables (según el documento de reglas de negocio).
- Que ninguna prohibición absoluta fue infringida.
- Que las decisiones no triviales tienen una fuente documentada que las respalda.
- Que, si hubo una asunción, esta quedó declarada explícitamente en la respuesta.

Si alguna de estas condiciones no se cumple, la tarea no se considera cerrada.

---

## Lo que este documento NO cubre

Este documento NO define:

- Reglas de negocio del laboratorio (JWT, backoff, offline, prohibiciones absolutas).
- Arquitectura de la aplicación ni sus capas.
- Endpoints, contratos de API ni códigos HTTP.
- Infraestructura compartida (cliente HTTP, estado global, caché, notificaciones).
- Comportamiento específico de ningún módulo.
- Diseño visual o UX.
- El mapa de documentos del sistema ni la tabla de Dueño Único por Concepto (vive en `README.md` de `/context`).
- El glosario de términos transversales (vive en su propio documento).
- Los criterios de evaluación de la defensa oral ni las preguntas que puede hacer el profesor (vive fuera de `/context`).
