/**
 * ╔══════════════════════════════════════════════════╗
 * ║   WixFox Digital Solutions — HTTPS Server       ║
 * ║   Serves your website over secure HTTPS         ║
 * ╚══════════════════════════════════════════════════╝
 *
 * HOW TO RUN:
 *   1. Generate SSL certificates first:   node generate-ssl.js
 *   2. Start the server:                  node server.js
 *   3. Open in browser:                   https://localhost:443
 *
 * FOR PRODUCTION (real domain):
 *   - Replace ssl/cert.pem and ssl/key.pem with your real SSL certificates
 *   - Obtainable free via: https://letsencrypt.org
 */

'use strict';

const https    = require('https');
const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const security = require('./security');

// ── Configuration ──────────────────────────────────────────
const CONFIG = {
  HTTPS_PORT : process.env.HTTPS_PORT || 443,
  HTTP_PORT  : process.env.HTTP_PORT  || 80,   // redirects to HTTPS
  PUBLIC_DIR : path.join(__dirname, 'public'),
  SSL_KEY    : path.join(__dirname, 'ssl', 'key.pem'),
  SSL_CERT   : path.join(__dirname, 'ssl', 'cert.pem'),
};

// ── MIME types ─────────────────────────────────────────────
const MIME = {
  '.html' : 'text/html; charset=utf-8',
  '.css'  : 'text/css; charset=utf-8',
  '.js'   : 'application/javascript; charset=utf-8',
  '.json' : 'application/json',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.jpeg' : 'image/jpeg',
  '.gif'  : 'image/gif',
  '.svg'  : 'image/svg+xml',
  '.ico'  : 'image/x-icon',
  '.woff' : 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf'  : 'font/ttf',
  '.mp4'  : 'video/mp4',
  '.webp' : 'image/webp',
  '.pdf'  : 'application/pdf',
};

// ── Request handler ────────────────────────────────────────
function handleRequest(req, res) {
  // ── Run all security checks first ──
  const check = security.checkRequest(req);
  if (check.blocked) {
    const ts = new Date().toLocaleTimeString();
    console.log(`  [${ts}] 🚫 BLOCKED ${req.method} ${req.url} — ${check.reason}`);
    security.sendBlocked(res, check.code, check.reason);
    return;
  }

  // Strip query strings, decode URI
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Default to index.html
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = path.join(CONFIG.PUBLIC_DIR, urlPath);

  // Ensure resolved path is inside public dir
  if (!filePath.startsWith(CONFIG.PUBLIC_DIR)) {
    security.sendBlocked(res, 403, 'Outside public directory');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const htmlPath = filePath.endsWith('.html') ? null : filePath + '.html';
      if (htmlPath) {
        fs.stat(htmlPath, (e2, s2) => {
          if (!e2 && s2.isFile()) serveFile(htmlPath, req, res);
          else serve404(res);
        });
      } else {
        serve404(res);
      }
      return;
    }
    serveFile(filePath, req, res);
  });
}

function serveFile(filePath, req, res) {
  const ext      = path.extname(filePath).toLowerCase();
  const mimeType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500); res.end('Internal Server Error'); return;
    }
    security.applySecurityHeaders(res);
    res.setHeader('Cache-Control', ext === '.html'
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=86400'           // 1 day for assets
    );
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);

    const ts = new Date().toLocaleTimeString();
    console.log(`  [${ts}] 200 ${req.url}`);
  });
}

function serve404(res) {
  security.applySecurityHeaders(res);
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html><html><head><title>404 — WixFox</title>
  <style>body{font-family:sans-serif;background:#0A0C10;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px}
  h1{font-size:80px;margin:0;color:#FF6B00}p{color:#8A9BB5}a{color:#FF6B00;text-decoration:none}</style></head>
  <body><h1>404</h1><p>Page not found.</p><a href="/">← Back to WixFox</a></body></html>`);
}

// ── Check SSL files exist ──────────────────────────────────
if (!fs.existsSync(CONFIG.SSL_KEY) || !fs.existsSync(CONFIG.SSL_CERT)) {
  console.error('\n  ❌  SSL certificates not found!');
  console.error('  👉  Run this first:  node generate-ssl.js\n');
  process.exit(1);
}

// ── HTTPS server ───────────────────────────────────────────
const sslOptions = {
  key  : fs.readFileSync(CONFIG.SSL_KEY),
  cert : fs.readFileSync(CONFIG.SSL_CERT),
};

const httpsServer = https.createServer(sslOptions, handleRequest);

httpsServer.listen(CONFIG.HTTPS_PORT, () => {
  console.log('\n  ╔══════════════════════════════════════════╗');
  console.log('  ║   🦊  WixFox HTTPS Server Running        ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║   🔒  https://localhost:${CONFIG.HTTPS_PORT}            ║`);
  console.log(`  ║   📁  Serving: ${path.basename(CONFIG.PUBLIC_DIR)}                     ║`);
  console.log('  ║   Press Ctrl+C to stop                   ║');
  console.log('  ╚══════════════════════════════════════════╝\n');
});

// ── HTTP → HTTPS redirect server ──────────────────────────
const httpServer = http.createServer((req, res) => {
  const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
  const redirectUrl = `https://${host}:${CONFIG.HTTPS_PORT}${req.url}`;
  res.writeHead(301, { Location: redirectUrl });
  res.end();
  console.log(`  [redirect] http → https${req.url}`);
});

httpServer.listen(CONFIG.HTTP_PORT, () => {
  console.log(`  🔄  HTTP redirect active on port ${CONFIG.HTTP_PORT} → HTTPS\n`);
});

// ── Graceful shutdown ──────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n\n  👋  WixFox server stopped. Goodbye!\n');
  httpsServer.close();
  httpServer.close();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  if (err.code === 'EACCES') {
    console.error(`\n  ❌  Permission denied on port ${err.port || ''}.`);
    console.error('  👉  Try running with sudo, or change HTTPS_PORT / HTTP_PORT in server.js\n');
  } else {
    console.error('  ❌  Error:', err.message);
  }
  process.exit(1);
});
