# Guía de comandos — dev-proxy.js (defensa oral)

## Arranque (dos terminales)

```
# Terminal 1
npm run dev

# Terminal 2
node dev-proxy.cjs
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

# Error de servidor en login
http://localhost:8000/__chaos/500?scope=auth&times=1

# Error de servidor en todo (auth + data), 5 intentos por defecto
http://localhost:8000/__chaos/500

# Indefinido a propósito (usar con cuidado, requiere /off manual)
http://localhost:8000/__chaos/500?times=0

# Apagado de emergencia — cortar esto ante cualquier duda
http://localhost:8000/__chaos/off
```

## Notas

- Sin `scope`, el fallo afecta tanto `/auth/*` como `/get/*` (comportamiento
  igual al original del script).
- Sin `times`, el default es 5 intentos (no infinito) — cubre las 4
  verificaciones en paralelo del Monitor de Integridad con margen, y se
  autodesactiva solo si te olvidás de `/off`.
- `/__chaos` (sin subruta) solo consulta el estado actual, no lo cambia.
- `/__chaos/off` es inmediato y sincrónico: no hace falta reiniciar Vite
  ni el proxy.
