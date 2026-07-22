#!/usr/bin/env node
/* ============================================================
   dev-all.cjs — Levanta Vite (:5173) y dev-proxy.cjs (:8000)
   juntos con un solo comando ("npm run dev"), y apaga ambos si
   cualquiera de los dos muere o si se corta con Ctrl+C.
   ============================================================ */

'use strict';

const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

// Vive en /tools; PROJECT_ROOT es la raíz real, donde están node_modules y vite.config.js.
const PROJECT_ROOT = path.join(__dirname, '..');
const isWin = process.platform === 'win32';
const viteBin = path.join(PROJECT_ROOT, 'node_modules', '.bin', isWin ? 'vite.cmd' : 'vite');

function prefixed(label, child) {
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on('line', (line) => {
      console.log(`[${label}] ${line}`);
    });
  }
}

const proxy = spawn(process.execPath, [path.join(__dirname, 'dev-proxy.cjs')], { cwd: PROJECT_ROOT });
// shell: true porque en Windows vite.cmd es un script de shell, no un
// ejecutable nativo: spawn() sin shell tira EINVAL al intentar lanzarlo.
const vite = spawn(viteBin, [], { cwd: PROJECT_ROOT, shell: isWin });

prefixed('proxy', proxy);
prefixed('vite ', vite);

const procs = [proxy, vite];
let shuttingDown = false;

function shutdown(reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (reason) console.log(`\n[dev-all] ${reason}, apagando ambos procesos...`);
  for (const p of procs) if (!p.killed) p.kill();
  process.exit();
}

proxy.on('exit', (code) => shutdown(`dev-proxy.cjs terminó (code ${code})`));
vite.on('exit', (code) => shutdown(`vite terminó (code ${code})`));
process.on('SIGINT', () => shutdown('interrumpido (Ctrl+C)'));
process.on('SIGTERM', () => shutdown('SIGTERM recibido'));
