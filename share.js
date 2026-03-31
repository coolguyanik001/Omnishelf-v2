#!/usr/bin/env node
/**
 * OmniShelf — npm run share
 * Detects local IPv4, starts Vite on 0.0.0.0:5173, prints QR-ready URL.
 */
'use strict';

const { networkInterfaces } = require('os');
const { execSync, spawn }   = require('child_process');

// ── Detect local IPv4 ──────────────────────────────────────────
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip loopback and non-IPv4
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

const ip   = getLocalIP();
const port = process.env.PORT || 5173;
const url  = `http://${ip}:${port}`;

console.log('\n');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║            OmniShelf — Network Share             ║');
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  Local:   http://localhost:${port}                ║`);
console.log(`║  Network: ${url.padEnd(38)} ║`);
console.log('║                                                  ║');
console.log('║  Open this URL on any device on your Wi-Fi.     ║');
console.log('║  Press Ctrl+C to stop.                          ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

// ── Start Vite bound to all interfaces ────────────────────────
const args = ['vite', '--host', '0.0.0.0', '--port', String(port)];

// Check if we're serving dist (production) or running dev server
const isPreview = process.argv.includes('--preview');
if (isPreview) args.splice(1, 0, 'preview');

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (e) => {
  console.error('Failed to start server:', e.message);
  process.exit(1);
});

child.on('exit', (code) => process.exit(code));

// Graceful shutdown
process.on('SIGINT',  () => { child.kill('SIGINT');  });
process.on('SIGTERM', () => { child.kill('SIGTERM'); });
