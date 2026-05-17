/**
 * WixFox Digital Solutions
 * security.js — Security Middleware & Headers
 */

'use strict';

/**
 * Apply security headers to every response
 */
function applySecurityHeaders(res) {
  // Force HTTPS for 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');

  // Content Security Policy
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

/**
 * Block malicious user agents
 */
function isBadBot(userAgent) {
  if (!userAgent) return false;
  const bad = /havij|libwww-perl|nikto|sqlmap|acunetix|nessus|masscan|zmeu|dirbuster/i;
  return bad.test(userAgent);
}

/**
 * Check for SQL injection / XSS in URL
 */
function isMaliciousRequest(url) {
  const patterns = [
    /<script/i,
    /union.*select/i,
    /insert.*into/i,
    /drop.*table/i,
    /\.\.\//,
    /127\.0\.0\.1/,
    /localhost/i
  ];
  return patterns.some(p => p.test(url));
}

/**
 * Block access to sensitive files
 */
function isSensitiveFile(url) {
  return /\.(pem|key|crt|env|sql|sh|bash|log|bak|backup)$/i.test(url) ||
         /^\/(ssl|node_modules|\.git)\//i.test(url);
}

/**
 * Rate limiting — simple in-memory store
 */
const rateStore = new Map();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateStore.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_WINDOW) {
    // Reset window
    rateStore.set(ip, { count: 1, start: now });
    return false;
  }

  entry.count++;
  rateStore.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

// Clean up rate store every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateStore.entries()) {
    if (now - entry.start > RATE_WINDOW * 2) rateStore.delete(ip);
  }
}, 5 * 60 * 1000);

/**
 * Main security middleware
 */
function securityMiddleware(req, res, next) {
  const ip = req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const ua = req.headers['user-agent'] || '';
  const url = req.url || '/';

  // Apply security headers
  applySecurityHeaders(res);

  // Block bad bots
  if (isBadBot(ua)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Block malicious URLs
  if (isMaliciousRequest(url)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  // Block sensitive file access
  if (isSensitiveFile(url)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Rate limiting
  if (isRateLimited(ip)) {
    res.writeHead(429, { 'Content-Type': 'text/plain', 'Retry-After': '60' });
    res.end('429 Too Many Requests');
    return;
  }

  // Block non-standard methods
  if (!['GET', 'POST', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, POST, HEAD' });
    res.end('405 Method Not Allowed');
    return;
  }

  if (typeof next === 'function') next();
}

module.exports = {
  applySecurityHeaders,
  securityMiddleware,
  isBadBot,
  isMaliciousRequest,
  isSensitiveFile,
  isRateLimited
};
