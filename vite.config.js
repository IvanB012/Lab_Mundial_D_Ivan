import { defineConfig } from 'vite'

// Prerrequisito del ítem de Login (ROADMAP.md): /auth/* tiene un bug de
// CORS real en el servidor externo (falta Access-Control-Allow-Origin).
// Este proxy reenvía esas rutas server-side, donde CORS no aplica.
// /get/* no se toca — ya funciona sin este problema (04_api_contract.md §2).
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://worldcup26.ir',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
