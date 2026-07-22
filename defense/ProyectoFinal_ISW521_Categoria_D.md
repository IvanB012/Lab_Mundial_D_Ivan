Universidad Técnica Nacional

Carrera de Ingeniería del Software

ISW-521: Programación en Ambiente Web I

Profesor: Lic. Bryan Miguel Chaves Salas

Modalidad: Individual

Valor: 100 puntos

Porcentaje: 15%



Catálogo de Proyectos - Categoría D: Herramientas Técnicas y Periodísticas

1. Introducción y Reglas del Proyecto

1.1 Tecnologías Obligatorias

Este laboratorio exige construir una aplicación JavaScript interactiva. No es un ejercicio de maquetado: requiere manipulación avanzada del DOM, manejo de eventos, consumo de la API REST pública del Mundial 2026 (https://worldcup26.ir) mediante Fetch, uso exclusivo de async/await en cada llamada asíncrona, y manejo explícito de errores HTTP. Una aplicación que solo muestra datos cuando todo funciona correctamente no cumple el alcance del laboratorio.

1.2 El Mito del “Happy Path”

Un laboratorio que solo funciona en el “camino feliz”, es decir, cuando la API responde sin errores y la red nunca falla, obtiene una nota drásticamente reducida, sin importar qué tan completa o vistosa sea la funcionalidad visible. El manejo de errores no es un detalle adicional: es el núcleo de la evaluación de este proyecto. Una interfaz perfecta que se rompe ante un error 401, 429 o 500 no demuestra dominio del curso.

1.3 Uso de Inteligencia Artificial

El uso de herramientas de inteligencia artificial está permitido como apoyo durante el desarrollo. Sin embargo, la defensa técnica evalúa la comprensión genuina del código entregado, sin distinción de su origen. Un código generado por IA que el estudiante no pueda explicar ni defender con criterio propio no sobrevive la defensa, sin importar si la aplicación funciona correctamente.

1.4 Política de Calificación

Regla estricta: si el estudiante no supera la defensa oral y técnica, la nota máxima del laboratorio se reduce automáticamente al 50%, independientemente de si la interfaz es perfecta o si la calidad del código entregado es excelente. La defensa no es un trámite posterior a la entrega: es parte integral de la calificación.

1.5 Arquitectura Base de Resiliencia (obligatoria)

Todo proyecto de este catálogo debe implementar, sin excepción, los siguientes cinco puntos:

Autenticación JWT. El token se obtiene autenticándose contra la API y se envía en cada petición como Authorization: Bearer <token>. Ninguna llamada a un endpoint de datos puede omitir este encabezado.

‘async/await‘ exclusivo. Toda llamada a fetch se resuelve con async/await. No se acepta .then() ni .catch() en ninguna parte del código entregado.

Manejo del error 401 sin recargar la página. Si la API responde 401, la interfaz debe limpiar el token guardado y mostrar una pantalla o modal de “sesión expirada” con opción de reautenticarse, sin invocar window.location.reload() ni equivalentes.

Backoff exponencial para errores 500 y 429. Ante un error de servidor (500) o de límite de tasa (429), el cliente reintenta automáticamente con espera creciente (por ejemplo 1s, 2s, 4s, 8s). En el caso específico del 429, la interfaz debe mostrar un countdown visible (cuenta atrás en segundos) que indique cuándo ocurrirá el siguiente reintento automático.

Modo offline con ‘localStorage‘. La última respuesta exitosa de cada endpoint se guarda en localStorage. Si una petición nueva falla y existe una copia cacheada, la interfaz debe mostrar esos datos junto con un indicador visible de que son datos no actualizados.

1.6 Prohibiciones Absolutas

Ningún proyecto se aprueba si el código entregado contiene:

alert(), en cualquier punto del flujo, incluyendo el manejo de errores.

.then() o .catch(), incluso si conviven con async/await en otra parte del archivo.

window.location.reload() (o equivalente) como mecanismo para resolver un error de sesión o de red.

2. Proyectos de la Categoría D: Herramientas Técnicas y Periodísticas

Esta categoría agrupa proyectos centrados en herramientas de utilidad práctica: notificaciones en tiempo real, exportación a impresión, monitoreo de salud de servicios y construcción de brackets. La dificultad principal está en controlar con precisión el ciclo de vida de cada petición (tiempos de espera, cancelaciones, reintentos).

2.1. Live Ticker 

Objetivo Técnico: practicar polling con backoff exponencial y notificaciones no bloqueantes construidas en el DOM.

Endpoints a Consumir: GET /get/games.

Funcionalidades Exigidas:

Polling periódico sobre /get/games, comparando el estado anterior en memoria contra la respuesta nueva.

Al detectar un cambio de marcador en cualquier partido, mostrar una notificación tipo “toast” (elemento propio del DOM, nunca alert()) que aparezca y se retire sola tras unos segundos.

El Reto de Resiliencia: si un ciclo de polling devuelve 429, el intervalo de espera se duplica en cada reintento (backoff exponencial) antes del siguiente intento, mostrando el countdown correspondiente. Mientras dura el backoff, se muestra un toast discreto de “actualización en pausa” sin congelar el resto del ticker ni borrar los marcadores ya mostrados.

2.2. Exportador de Reportes 

Objetivo Técnico: practicar manipulación del DOM orientada a impresión, usando @media print para controlar el resultado final.

Endpoints a Consumir: GET /get/games, GET /get/teams, GET /get/stadiums.

Funcionalidades Exigidas:

Generar una vista de reporte que cruce partidos, equipos y estadios en una tabla o resumen legible.

Definir reglas @media print que fuercen un layout en blanco y negro al imprimir (sin colores de fondo ni banderas a color).

Incluir un botón “Exportar” que dispare window.print() sobre la vista ya preparada.

El Reto de Resiliencia: si alguno de los tres recursos no cargó, el botón de exportar sigue funcionando con los datos disponibles. El reporte impreso indica explícitamente qué sección no pudo completarse, en lugar de bloquear la exportación completa.

2.3. Monitor de Integridad 

Objetivo Técnico: practicar control de tiempos de espera en peticiones HTTP usando AbortController.

Endpoints a Consumir: GET /get/teams, GET /get/groups, GET /get/games, GET /get/stadiums.

Funcionalidades Exigidas:

Una pantalla con un indicador visual (tipo semáforo) por cada uno de los cuatro endpoints listados arriba.

Cada chequeo usa AbortController para cancelar la petición si supera un tiempo límite definido (por ejemplo 5 segundos), marcando ese endpoint como “tiempo agotado” en vez de quedarse cargando indefinidamente.

Botón para volver a probar los cuatro endpoints de forma manual.

El Reto de Resiliencia: cada endpoint se evalúa de forma independiente. Si tres responden correctamente y uno agota el tiempo límite, solo ese indicador se marca en rojo, sin afectar el estado de los otros tres ni reiniciar mediciones ya completadas.

2.4. Buscador Bilingüe 

Objetivo Técnico: practicar manipulación masiva del DOM ya renderizado, sin depender de nuevas peticiones a la API.

Endpoints a Consumir: GET /get/teams, GET /get/stadiums.

Funcionalidades Exigidas:

Un switch global (un solo control) que recorra todo el DOM renderizado y alterne entre los campos name_en y name_fa de equipos y estadios.

Los datos de ambos idiomas se cachean en memoria desde la primera llamada; el switch nunca vuelve a pedir datos a la API.

El Reto de Resiliencia: si el usuario cambia el idioma mientras una petición sigue en curso, el switch no debe romperse ni mostrar campos undefined. El idioma elegido se aplica en cuanto los datos lleguen, respetando el último valor del switch y no el que estaba activo cuando se inició la petición.

2.5. Árbol de Eliminatorias 

Objetivo Técnico: practicar la construcción de un layout jerárquico (bracket) con CSS Grid o Flexbox a partir de datos filtrados por tipo de fase.

Endpoints a Consumir: GET /get/games, GET /get/teams.

Funcionalidades Exigidas:

Filtrar de /get/games los partidos cuyo type corresponda a fase eliminatoria (distinto de “group”).

Ordenarlos por ronda y renderizarlos como un bracket visual que conecte cada partido con el siguiente cruce correspondiente.

Cruzar home_team_id y away_team_id contra /get/teams para mostrar nombres reales.

El Reto de Resiliencia: si la fase eliminatoria todavía no tiene datos disponibles (el torneo sigue en fase de grupos), el bracket se renderiza con las casillas vacías marcadas como “Por definir”, en lugar de no mostrar nada. Si la petición falla después de que el bracket parcial ya se dibujó, las rondas ya resueltas se conservan y solo las rondas pendientes de cruce se marcan en estado de error.

3. Guía de Defensa Técnica

Antes de calificar el laboratorio, el profesor realiza una defensa oral y técnica en vivo, individual, frente al computador del estudiante. La defensa se compone de dos partes y se aplica sobre el proyecto entregado de esta categoría.

3.1 Preguntas Teóricas

El profesor puede preguntar, entre otras:

¿Qué pasa exactamente si la API devuelve un error 500 durante un ciclo de polling o de chequeo de salud?

¿Por qué se usó async/await y no .then/.catch en la función que maneja el AbortController o el intervalo de polling?

¿Qué ocurre en la interfaz si el token JWT expira mientras el ticker o el monitor siguen corriendo en segundo plano?

¿Por qué no se usa window.location.reload() para resolver un error de sesión?

¿Qué pasaría si el tiempo límite de tu AbortController se agota justo cuando la respuesta está por llegar?

3.2 Pruebas Prácticas en DevTools

El profesor exige que el estudiante demuestre en vivo, usando las herramientas de desarrollador del navegador:

Pestaña Console: la captura del error correspondiente (401, 429 o 500) sin que la aplicación se rompa visualmente ni quede en blanco.

Pestaña Network: el estado de la petición fallida (código de estado, encabezados, cuerpo de la respuesta) y, si aplica, los reintentos generados por el backoff exponencial, incluyendo los tiempos de espera entre cada uno.

El estudiante que no pueda reproducir estas pruebas en vivo, o que no pueda explicar por qué su código responde de esa manera, no aprueba la defensa, independientemente de la calidad visual del proyecto entregado.

4. Rúbrica de Evaluación de Cumplimiento del Proyecto (50 puntos)

Total Rúbrica de Cumplimiento del Proyecto: 50 puntos.

5. Rúbrica de Evaluación de Defensa Técnica (50 puntos)

Total Rúbrica de Defensa Técnica: 50 puntos.

Nota sobre la calificación total: el laboratorio tiene un valor total de 100 puntos, compuestos por 50 puntos de la Rúbrica de Cumplimiento del Proyecto y 50 puntos de la Rúbrica de Defensa Técnica. Si el estudiante no supera la defensa oral y técnica, es decir, si obtiene menos de 25 de los 50 puntos de la Rúbrica de Defensa Técnica, la nota máxima total del laboratorio se reduce automáticamente al 50% (50 de 100 puntos), independientemente del puntaje obtenido en la Rúbrica de Cumplimiento del Proyecto.