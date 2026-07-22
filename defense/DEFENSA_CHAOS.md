# Guía de comandos — dev-proxy.js (defensa oral)

## Arranque (dos terminales)

```
# Terminal 1
npm run dev

# Terminal 2
node tools/dev-proxy.cjs
```

(`.cjs` y no `.js`: el `package.json` del proyecto tiene `"type": "module"`,
así que un `.js` se interpretaría como ES Module y el `require()` del
script rompería. `.cjs` fuerza CommonJS sin tocar el código.)

`.env.development.local` ya apunta `VITE_API_BASE_URL` y `VITE_AUTH_BASE_URL`
a `http://localhost:8000`. Si ese archivo no existe o esas variables no
están seteadas, la app le pega a `worldcup26.ir` como siempre — el proxy
es opt-in.

## Comandos de control (`GET`, se pueden abrir directo en el navegador)

```
# Sesión expirada mientras se usa la app (Live Ticker, Knockout Tree,
# Monitor de Integridad, Buscador Bilingüe)
http://localhost:8000/__chaos/401?scope=data

# Login rechazado (credenciales inválidas / token rechazado)
http://localhost:8000/__chaos/401?scope=auth&times=1

# Rate limit en datos, con backoff/countdown visible (3 intentos)
http://localhost:8000/__chaos/429?scope=data&times=3

# Error de servidor en datos (backoff sin countdown, 3 intentos)
http://localhost:8000/__chaos/500?scope=data&times=3

# Error de servidor en login
http://localhost:8000/__chaos/500?scope=auth&times=1

# Error de servidor en todo (auth + data), 5 intentos por defecto
http://localhost:8000/__chaos/500

# Indefinido a propósito (usar con cuidado, requiere /off manual)
http://localhost:8000/__chaos/500?times=0

# Apagado de emergencia — cortar esto ante cualquier duda
http://localhost:8000/__chaos/off
```

## Simular el timeout de 5s del Monitor de Integridad

`/__chaos` no sirve para esto: solo inyecta códigos de error instantáneos
(401/429/500), nunca demora una respuesta. El timeout de `AbortController`
(`08_integrity_monitor.md`, tope de 5s) hay que probarlo con la
funcionalidad nativa de DevTools, no con el proxy:

```
1. DevTools > pestaña Network > menú "No throttling" (arriba a la derecha)
2. "Add custom profile..." (o "Edit..." según la versión de Chrome)
3. Crear un perfil con latencia > 5000 ms (ej. 6000 ms), sin límite de
   descarga/subida necesario
4. Seleccionar ese perfil como throttling activo
5. Recargar o abrir la pestaña "Monitor de Integridad" / tocar "Reintentar"
```

Con la latencia forzada por encima del límite del módulo, los 4 semáforos
deben pasar a rojo con "Tiempo agotado" a los 5s exactos — no antes,
y sin esperar a que la respuesta lenta efectivamente llegue. Confirmar
en Network que la petición sigue "pendiente" más allá de los 5s (la
demora la sigue aplicando el navegador) mientras la UI ya marcó timeout.
No olvidar volver a "No throttling" al terminar, para no arrastrar la
demora a las otras pruebas de esta guía.

## Notas

- Sin `scope`, el fallo afecta tanto `/auth/*` como `/get/*` (comportamiento
  igual al original del script).
- Sin `times`, el default es 5 intentos (no infinito) — cubre las 4
  verificaciones en paralelo del Monitor de Integridad con margen, y se
  autodesactiva solo si te olvidás de `/off`.
- `/__chaos` (sin subruta) solo consulta el estado actual, no lo cambia.
- `/__chaos/off` es inmediato y sincrónico: no hace falta reiniciar Vite
  ni el proxy.
