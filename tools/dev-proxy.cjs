#!/usr/bin/env node
/* ============================================================
   dev-proxy.js — Servidor de desarrollo
   ============================================================ */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 8000;
// Vive en /tools; ROOT debe seguir siendo la raíz del proyecto para serveStatic().
const ROOT = path.join(__dirname, '..');
const UPSTREAM = 'https://worldcup26.ir';

// Prefijos que se reenvían a la API (todo lo demás se sirve como archivo).
const API_PREFIXES = ['/auth', '/get', '/health', '/api'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

const isApiPath = (p) => API_PREFIXES.some((pre) => p === pre || p.startsWith(`${pre}/`));

/* ============================================================
   CORS — el navegador le pega a este proxy en un origen distinto
   (localhost:8000) al de la app (localhost:5173 vía Vite), así que
   esto ya no es servidor-a-servidor: hace falta responder CORS
   propio, incluyendo el preflight OPTIONS que dispara cualquier
   fetch con header Authorization o Content-Type: application/json.
   ============================================================ */
function handlePreflight(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
  });
  res.end();
}

/* ============================================================
   INYECCIÓN DE FALLOS
   ============================================================ */
let chaos = { status: 0, remaining: 0, scope: 'all' };

// /auth/* (login/register) vs /get,/health,/api (resto de los datos).
function scopeOf(pathname) {
  return pathname.startsWith('/auth') ? 'auth' : 'data';
}

function handleChaosControl(req, res, pathname) {
  const m = pathname.match(/^\/__chaos(?:\/(off|401|429|500))?$/);
  if (!m) return false;
  const cmd = m[1];
  const params = new URL(req.url, 'http://x').searchParams;

  if (cmd === 'off') {
    chaos = { status: 0, remaining: 0, scope: 'all' };
  } else if (cmd) {
    const timesParam = params.get('times');
    const times = Number(timesParam);
    const scopeParam = params.get('scope');
    const scope = ['auth', 'data'].includes(scopeParam) ? scopeParam : 'all';
    // Sin "times" (timesParam === null): 5 intentos por defecto (no
    // infinito), para no quedar "pegado" si te olvidás de /__chaos/off
    // en medio de la demo. times=0 pide infinito de forma explícita.
    const remaining = timesParam === '0' ? Infinity : Number.isFinite(times) && times > 0 ? times : 5;
    chaos = { status: Number(cmd), remaining, scope };
  }

  const view = {
    activo: chaos.status !== 0,
    status: chaos.status || null,
    scope: chaos.scope,
    restantes: chaos.remaining === Infinity ? '∞ (hasta /__chaos/off)' : chaos.remaining,
  };
  console.log(`[chaos] control -> ${cmd || 'consulta'}:`, view);
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ ok: true, chaos: view }, null, 2));
  return true;
}

function maybeInjectFault(req, res, pathname) {
  if (!chaos.status || chaos.remaining <= 0) return false;
  if (chaos.scope !== 'all' && chaos.scope !== scopeOf(pathname)) return false;
  if (chaos.remaining !== Infinity) chaos.remaining -= 1;

  // Drena el body sin leerlo (relevante ahora que también se puede
  // inyectar en POST /auth/*): si no se consume, puede quedar basura en
  // el socket que rompa el parseo de la siguiente petición keep-alive.
  req.resume();

  const status = chaos.status;
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'X-Chaos-Injected': String(status), // visible en Network > Headers
  };
  if (status === 429) {
    headers['Retry-After'] = '1';
    headers['Access-Control-Expose-Headers'] = 'Retry-After';
  }

  const body = {
    error: `Fallo inyectado (${status}) por dev-proxy /__chaos — solo para la defensa`,
    status,
    endpoint: req.url,
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
  const left = chaos.remaining === Infinity ? '∞' : chaos.remaining;
  console.log(`[chaos] ${status} (scope=${chaos.scope}) inyectado -> ${req.method} ${req.url}  (restan: ${left})`);
  return true;
}

/* -------------------- Proxy a la API upstream -------------------- */
function proxy(req, res) {
  const target = new URL(req.url, UPSTREAM);

  // Copiamos las cabeceras del cliente pero corregimos Host y quitamos
  // las de origen del navegador: al ir servidor-a-servidor no hay CORS,
  // y así el upstream ve una petición "limpia".
  const headers = { ...req.headers, host: target.host };
  delete headers.origin;
  delete headers.referer;

  const upstreamReq = https.request(
    {
      hostname: target.hostname,
      port: 443,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      // El upstream no conoce (ni le importa) el origen real del navegador
      // (localhost:8000); garantizamos el CORS nosotros en la respuesta
      // que sale de este proxy, sin depender de lo que mande worldcup26.ir.
      const responseHeaders = {
        ...upstreamRes.headers,
        'access-control-allow-origin': req.headers.origin || '*',
      };
      res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
      upstreamRes.pipe(res);
    },
  );

  upstreamReq.on('error', (err) => {
    console.error(`[proxy] error -> ${req.method} ${req.url}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Bad gateway (dev-proxy no pudo contactar el upstream)' }));
  });

  // Reenvía el cuerpo (POST /auth/*) tal cual.
  req.pipe(upstreamReq);
}

/* -------------------- Servir archivos estáticos -------------------- */
function serveStatic(req, res) {
  // Normaliza y evita path traversal fuera de ROOT.
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(ROOT, urlPath === '/' ? '/index.html' : urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

http
  .createServer((req, res) => {
    const pathname = req.url.split('?')[0];
    // Endpoint de control de la inyección de fallos (defensa).
    if (pathname === '/__chaos' || pathname.startsWith('/__chaos/')) {
      if (handleChaosControl(req, res, pathname)) return;
    }
    if (isApiPath(pathname)) {
      if (req.method === 'OPTIONS') {
        handlePreflight(req, res);
        return;
      }
      if (maybeInjectFault(req, res, pathname)) return; // fallo forzado, no llega al upstream
      proxy(req, res);
    } else {
      serveStatic(req, res);
    }
  })
  .listen(PORT, () => {
    console.log(`\n  CyberCup 26 · dev-proxy`);
    console.log(`  ▸ App:      http://localhost:${PORT}`);
    console.log(`  ▸ API  →    ${UPSTREAM}  (proxy de ${API_PREFIXES.join(', ')})`);
    console.log(`  ▸ Caos:     /__chaos/401|429|500[?scope=auth|data][&times=N] · /__chaos/off`);
    console.log(`  ▸ Ctrl+C para detener\n`);
  });
