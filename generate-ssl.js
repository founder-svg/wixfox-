/**
 * ╔══════════════════════════════════════════════════╗
 * ║   WixFox — Self-Signed SSL Certificate Generator ║
 * ║   Generates ssl/key.pem and ssl/cert.pem         ║
 * ╚══════════════════════════════════════════════════╝
 *
 * RUN:  node generate-ssl.js
 *
 * NOTE: Self-signed certs are perfect for localhost / LAN development.
 *       For a live public domain, use Let's Encrypt (free) instead.
 *       See README.md → "Going Live" section for instructions.
 */

'use strict';

const { execSync } = require('child_process');
const fs           = require('fs');
const path         = require('path');

const SSL_DIR  = path.join(__dirname, 'ssl');
const KEY_FILE = path.join(SSL_DIR, 'key.pem');
const CRT_FILE = path.join(SSL_DIR, 'cert.pem');

// Create ssl/ directory if it doesn't exist
if (!fs.existsSync(SSL_DIR)) {
  fs.mkdirSync(SSL_DIR, { recursive: true });
  console.log('  📁  Created ssl/ directory');
}

// Check if certs already exist
if (fs.existsSync(KEY_FILE) && fs.existsSync(CRT_FILE)) {
  console.log('\n  ✅  SSL certificates already exist in ssl/');
  console.log('  👉  Delete ssl/key.pem and ssl/cert.pem to regenerate.\n');
  process.exit(0);
}

console.log('\n  🔐  Generating self-signed SSL certificate...\n');

const subject = '/C=IN/ST=Gujarat/L=Gandhidham/O=WixFox Digital Solutions/CN=localhost';

try {
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${KEY_FILE}" -out "${CRT_FILE}" ` +
    `-days 825 -nodes -subj "${subject}" ` +
    `-addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`,
    { stdio: 'pipe' }
  );

  console.log('  ✅  SSL certificate generated successfully!\n');
  console.log('  📄  Files created:');
  console.log(`      ssl/key.pem   (${Math.round(fs.statSync(KEY_FILE).size / 1024)}KB) — Private key`);
  console.log(`      ssl/cert.pem  (${Math.round(fs.statSync(CRT_FILE).size / 1024)}KB) — Certificate\n`);
  console.log('  🚀  Now start your server:  node server.js');
  console.log('  🌐  Then open:              https://localhost:443\n');
  console.log('  ⚠️   Your browser will show a security warning for self-signed certs.');
  console.log('      Click "Advanced" → "Proceed to localhost" to continue.\n');

} catch (err) {
  console.error('\n  ❌  OpenSSL not found or failed.');
  console.error('  👉  Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html (Windows)');
  console.error('      Or on Linux/Mac: sudo apt install openssl / brew install openssl\n');
  console.error('  Error details:', err.message);
  process.exit(1);
}
