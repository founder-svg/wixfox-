/**
 * WixFox Digital Solutions
 * server.js — HTTPS Static Web Server
 *
 * Setup:  node generate-ssl.js
 * Run:    node server.js
 */

'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { securityMiddleware } = require('./security');

// ── Config ──────────────────────────────────────────────────────
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT) || 443;
const HTTP_PORT  = parseInt(process.env.HTTP_PORT)  || 80;
const ROOT_DIR   = __dirname;
const SSL_KEY    = path.join(__dirname, 'ssl', 'key.pem');
const SSL_CERT   = path.join(__dirname, 'ssl', 'cert.pem');

// ── MIME types ───────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.css':  'text/css; charset=UTF-8',
  '.js':   'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
};

// ── Serve static files ───────────────────────────────────────────
function serveFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      serve404(res);
      return;
    }
    res.writeHead(statusCode, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=604800',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  });
}

function serve404(res) {
  const notFound = path.join(ROOT_DIR, '404.html');
  fs.readFile(notFound, (err, data) => {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(err ? '<h1>404 Not Found</h1>' : data);
  });
}

// ── Request handler ──────────────────────────────────────────────
function handleRequest(req, res) {
  securityMiddleware(req, res, () => {
    let urlPath = req.url.split('?')[0]; // strip query string

    // Clean up path
    urlPath = decodeURIComponent(urlPath).replace(/\.\./g, '');

    // Default to index.html
    if (urlPath === '/' || urlPath === '') {
      return serveFile(res, path.join(ROOT_DIR, 'index.html'));
    }

    const filePath = path.join(ROOT_DIR, urlPath);

    // Security: must be inside root
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403); res.end('403 Forbidden'); return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        // Try adding .html
        fs.stat(filePath + '.html', (err2, stat2) => {
          if (!err2 && stat2.isFile()) {
            serveFile(res, filePath + '.html');
          } else {
            serve404(res);
          }
        });
        return;
      }
      serveFile(res, filePath);
    });
  });
}

// ── HTTP → HTTPS redirect server ─────────────────────────────────
const httpServer = http.createServer((req, res) => {
  const host = req.headers.host || 'wixfox.com';
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
});

// ── HTTPS server ─────────────────────────────────────────────────
function startServer() {
  // Check SSL certs
  if (!fs.existsSync(SSL_KEY) || !fs.existsSync(SSL_CERT)) {
    console.error('\n❌ SSL certificates not found!');
    console.error('   Run: node generate-ssl.js\n');
    process.exit(1);
  }

  const sslOptions = {
    key:  fs.readFileSync(SSL_KEY),
    cert: fs.readFileSync(SSL_CERT),
    minVersion: 'TLSv1.2',
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-GCM-SHA256'
    ].join(':')
  };

  const httpsServer = https.createServer(sslOptions, handleRequest);

  httpsServer.listen(HTTPS_PORT, () => {
    console.log('\n🦊 WixFox Digital Solutions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ HTTPS Server → https://localhost:${HTTPS_PORT}`);
    console.log(`✅ HTTP  Redirect → http://localhost:${HTTP_PORT}`);
    console.log(`📁 Serving files from: ${ROOT_DIR}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  httpServer.listen(HTTP_PORT, () => {
    console.log(`🔄 HTTP→HTTPS redirect active on port ${HTTP_PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n⚠️  Shutting down gracefully...');
    httpsServer.close(() => { httpServer.close(() => process.exit(0)); });
  });

  process.on('SIGINT', () => {
    console.log('\n⚠️  Server stopped.');
    process.exit(0);
  });
}

startServer();
