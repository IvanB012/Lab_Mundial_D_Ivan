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

Texto “Sesión expirada” dentro del overlay de login: Acá la idea es que cuando login.js vuelve a mostrar el formulario porque detectó que la sesión murió (evento ‘session’ con active: false), le pases un flag o mensaje distinto al que usás cuando el usuario simplemente abre la app por primera vez. Es decir, el overlay de login ya existe y ya se reabre correctamente — solo le falta un <p> o <div> condicional arriba del formulario que diga “Tu sesión expiró, por favor inicia sesión de nuevo” solo cuando el reabrir vino de un 401, y que esté vacío/oculto cuando es el login inicial normal. Es literalmente una bandera booleana que ya tenés disponible (el mismo evento ‘session’ que dispara la reapertura) y un renderizado condicional de un párrafo — no toca nada de la lógica de autenticación ni del manejo de errores, es puramente de presentación.

Agregar un botón de cerrar sesión; un botón de “Cerrar sesión” es sencillo de sumar sin tocar tu arquitectura de resiliencia: solo necesita llamar la misma función ‘clearToken()‘ que ya usás en el manejo del 401 y disparar el mismo evento ‘’session’‘ con ‘active: false‘ que ya escucha ‘login.js‘ para reabrir el overlay. Como esa pieza ya existe y ya funciona correctamente para el caso del 401, el botón de logout manual es básicamente reutilizar ese mismo camino en lugar de crear uno nuevo — así te aseguras de que el comportamiento sea consistente (limpia el token, corta el polling/monitoreo en segundo plano si corresponde, y muestra el login de nuevo) sin duplicar lógica ni arriesgar inconsistencias entre el logout manual y el automático por sesión expirada.

El Live Ticker consulta la API cada 15 segundos, y en algunos casos el partido aún no tiene marcador registrado (la API responde null en lugar de un número). El código actual no contempla ese caso: toma el valor home_score/away_score y lo inserta directamente en el texto, por lo que un valor vacío (null) termina mostrándose literalmente como la palabra “null - null” en pantalla. Lo correcto sería detectar cuando el marcador viene vacío y mostrar en su lugar un texto más claro para el usuario, como “vs” o “Por definir”, en vez del valor técnico sin procesar.

En el ‘Monitor de Integridad’ en JavaScript mediante async/await estricto y fetch. Al simular una latencia de red de 6000 ms en DevTools para probar el límite de tiempo de 5 segundos con AbortController, todas las peticiones (/teams, /groups, /games y /stadiums) se cancelan en bloque y pasan a estado de error simultáneamente. Esto incumple el Reto de Resiliencia del enunciado, el cual exige que cada endpoint se evalúe de forma estricta e independiente, garantizando que si uno agota el tiempo límite, solo ese indicador cambie a rojo sin afectar ni reiniciar el estado de los demás. El problema radica en que la lógica actual está acoplando el ciclo de vida de las peticiones (posiblemente por compartir una única instancia global de AbortController, o por resolverlas en un hilo secuencial/bloqueante). Necesito corregir el código para que cada llamada a fetch instancie, ejecute y controle su propio AbortController de manera aislada y en paralelo, asegurando un manejo de errores individualizado por cada semáforo de la interfaz.

Conector visual del bracket: La idea es no tocar tu lógica de renderizado (knockoutTree.js sigue igual), sino agregarle “líneas” puramente con CSS a las tarjetas que ya están dibujadas en columnas. Cada columna de ronda ya tiene sus partidos apilados verticalmente con gap; lo que falta es que cada tarjeta tenga un pseudo-elemento ::after que dibuje una línea horizontal corta saliendo de su borde derecho, y la ronda siguiente tenga un ::before con una línea entrando por la izquierda — combinando eso con un borde vertical (border-right o un div absoluto) que conecte verticalmente el punto medio de dos partidos con la casilla que representa su cruce. Es el truco visual clásico de bracket de torneo (lo vas a reconocer de cualquier app de eliminación directa): no requiere SVG si tus columnas tienen alturas predecibles, solo position: relative en cada .knockout-match y posicionamiento absoluto calculado con top/height en los conectores. Si las alturas varían mucho entre rondas, ahí sí conviene usar un SVG superpuesto porque es más fácil calcular coordenadas exactas con JS que pelear con CSS puro.

Necesito que revises la implementación del módulo ‘Buscador Bilingüe’ en mi código. Validá de forma estricta que se cumplan este criterio arquitectónico y encontrar posibles fallas. Persistencia y Caché en Memoria: Comprobá que las peticiones a /get/teams y /get/stadiums se realicen únicamente la primera vez que se inicializa el módulo o se interactúa con él. Los datos de ambos idiomas (name_en y name_fa) deben quedar indexados de inmediato en una estructura de datos local en memoria (como un objeto, un array o un Map). Asegurate de que cualquier cambio posterior en el switch de idioma consuma exclusivamente esta variable local, garantizando que el flujo nunca vuelva a invocar la función fetch ni genere tráfico de red extra.

Revisemos el archivo correspondiente al módulo 'Árbol de Eliminatorias'. El código debe consumir de forma asíncrona /get/games y /get/teams, y aplicar de manera interna (sin interacción de botones del usuario) un filtro estricto para extraer únicamente los encuentros donde type !== 'group'. Necesito que verifiques minuciosamente la robustez del renderizado frente al Reto de Resiliencia:

Si las llaves avanzadas en el JSON carecen de datos, confirma que la lógica pinte las casillas correspondientes como 'Por definir' de forma controlada en el DOM.

Asegúrate de que el ciclo de renderizado de las rondas (Octavos, Cuartos, Semifinal, etc.) no esté acoplado en un único bloque destructivo; si una promesa falla o se interrumpe la red a mitad del proceso, las rondas que ya se calcularon con éxito deben conservarse visibles en el layout, aislando y marcando en estado de error visual únicamente los contenedores de las rondas pendientes que sufrieron el fallo.

















Practicar forzar el 429/500 en DevTools
Acá no es algo que agregues al código, sino un ensayo de cómo vas a manipular las herramientas del navegador en vivo frente al profesor. En la pestaña Network de DevTools podés activar “Block request URL” (clic derecho sobre una petición ya hecha a /get/games) para que las siguientes peticiones a ese endpoint fallen — eso simula un error de red que tu retryWithBackoff va a interpretar como fallo y activar los reintentos con countdown. Si querés simular específicamente un 429 o 500 con el código de estado exacto (para que se vea el countdown que solo se dispara en 429), lo más limpio es usar la opción de “Override” o interceptar la respuesta con el panel de Network Conditions, o directamente pedirle a tu API mock (si la controlás) o a un proxy local que devuelva esos códigos a propósito. Lo que sí tenés que tener clarísimo para la defensa es explicar qué pestaña estás usando (Console para ver que no se rompe, Network para ver el código de estado y los reintentos con sus tiempos), porque eso es literalmente lo que pide la Guía de Defensa Técnica del enunciado.

