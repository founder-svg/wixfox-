/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        WixFox Digital Solutions — security.js               ║
 * ║        Security middleware for the Node.js HTTPS server     ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Mirrors all .htaccess security rules for the Node.js server.
 * Imported and used automatically by server.js
 */

'use strict';

// ── Security headers (mirrors .htaccess Header directives) ────
function applySecurityHeaders(res) {
    // Force HTTPS for 1 year
    res.setHeader('Strict-Transport-Security',  'max-age=31536000; includeSubDomains; preload');
    // Prevent clickjacking
    res.setHeader('X-Frame-Options',            'SAMEORIGIN');
    // Prevent MIME sniffing
    res.setHeader('X-Content-Type-Options',     'nosniff');
    // XSS protection
    res.setHeader('X-XSS-Protection',           '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy',            'strict-origin-when-cross-origin');
    // Restrict browser features
    res.setHeader('Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
    // Content Security Policy — allows WhatsApp + Google Fonts + CDNs
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://wa.me https://api.whatsapp.com",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self' https://wa.me"
    ].join('; '));
    // Remove fingerprinting headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
}

// ── Bad user agent patterns (mirrors .htaccess RewriteCond) ───
const BAD_AGENTS = [
    /havij/i, /libwww-perl/i, /nikto/i, /sqlmap/i, /acunetix/i,
    /nessus/i, /openvas/i, /dirbuster/i, /nmap/i, /masscan/i,
    /zmeu/i, /harvest/i, /extract/i, /grab/i, /miner/i
];

// ── SQL injection / XSS patterns (mirrors .htaccess RewriteCond) ─
const BAD_QUERY_PATTERNS = [
    /<script/i,  /%3Cscript/i,
    /union\s+select/i, /drop\s+table/i, /insert\s+into/i,
    /delete\s+from/i,  /update\s+set/i,  /cast\s*\(/i,
    /benchmark\s*\(/i, /\.\.\//,          /localhost/i,
    /127\.0\.0\.1/,    /GLOBALS\s*=/i,    /_REQUEST\s*=/i,
    /\.(pem|key|crt|sh|bash|env)$/i
];

// ── Blocked file extensions ────────────────────────────────────
const BLOCKED_EXTENSIONS = new Set([
    '.pem', '.key', '.crt', '.csr', '.p12', '.pfx',
    '.bak', '.backup', '.old', '.orig', '.sql',
    '.conf', '.config', '.log', '.sh', '.bash',
    '.env', '.lock', '.yml', '.yaml', '.git'
]);

// ── Blocked path prefixes ──────────────────────────────────────
const BLOCKED_PATHS = ['/ssl/', '/node_modules/', '/.git/'];

// ── Allowed HTTP methods ───────────────────────────────────────
const ALLOWED_METHODS = new Set(['GET', 'POST', 'HEAD']);

// ── Max request body size: 10MB ───────────────────────────────
const MAX_BODY_BYTES = 10 * 1024 * 1024;

/**
 * Main security check.
 * Returns { blocked: true, code, reason } or { blocked: false }
 */
function checkRequest(req) {
    const method  = (req.method || '').toUpperCase();
    const url     = req.url || '/';
    const ua      = req.headers['user-agent'] || '';
    const qs      = url.split('?')[1] || '';
    const path    = url.split('?')[0].toLowerCase();
    const ext     = require('path').extname(path);

    // 1. Block disallowed HTTP methods
    if (!ALLOWED_METHODS.has(method)) {
        return { blocked: true, code: 405, reason: `Method ${method} not allowed` };
    }

    // 2. Block path traversal
    if (url.includes('..')) {
        return { blocked: true, code: 400, reason: 'Path traversal detected' };
    }

    // 3. Block sensitive file extensions
    if (BLOCKED_EXTENSIONS.has(ext)) {
        return { blocked: true, code: 403, reason: `Blocked file type: ${ext}` };
    }

    // 4. Block sensitive directories
    for (const blocked of BLOCKED_PATHS) {
        if (path.startsWith(blocked)) {
            return { blocked: true, code: 403, reason: `Blocked path: ${blocked}` };
        }
    }

    // 5. Block dot-files (except well-known safe ones)
    const filename = path.split('/').pop();
    const SAFE_DOTFILES = new Set(['robots.txt', 'sitemap.xml', 'manifest.json']);
    if (filename.startsWith('.') && !SAFE_DOTFILES.has(filename)) {
        return { blocked: true, code: 403, reason: 'Dot-file access blocked' };
    }

    // 6. Block bad bots
    for (const pattern of BAD_AGENTS) {
        if (pattern.test(ua)) {
            return { blocked: true, code: 403, reason: `Bad user agent blocked` };
        }
    }

    // 7. Block SQL injection / XSS in query string
    const decoded = decodeURIComponent(qs);
    for (const pattern of BAD_QUERY_PATTERNS) {
        if (pattern.test(decoded)) {
            return { blocked: true, code: 400, reason: 'Malicious query string detected' };
        }
    }

    return { blocked: false };
}

/**
 * Send a blocked response with a styled HTML error page.
 */
function sendBlocked(res, code, reason) {
    const messages = {
        400 : 'Bad Request',
        403 : 'Forbidden',
        405 : 'Method Not Allowed',
    };
    const title = messages[code] || 'Blocked';
    applySecurityHeaders(res);
    res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><title>${code} ${title} — WixFox</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0A0C10;color:#fff;font-family:'Segoe UI',sans-serif;
       display:flex;align-items:center;justify-content:center;
       min-height:100vh;flex-direction:column;gap:12px;padding:20px}
  .code{font-size:90px;font-weight:900;color:#FF6B00;line-height:1}
  .title{font-size:22px;font-weight:700;letter-spacing:1px}
  .reason{font-size:13px;color:#8A9BB5;margin-top:4px}
  a{color:#FF6B00;text-decoration:none;margin-top:16px;font-size:14px;
    border:1px solid rgba(255,107,0,0.3);padding:10px 24px;border-radius:50px;
    transition:all .3s}
  a:hover{background:#FF6B00;color:#fff}
</style></head>
<body>
  <div class="code">${code}</div>
  <div class="title">${title}</div>
  <div class="reason">${reason}</div>
  <a href="/">← Back to WixFox</a>
</body></html>`);
}

module.exports = { applySecurityHeaders, checkRequest, sendBlocked, MAX_BODY_BYTES };
