/**
 * WixFox Digital Solutions
 * generate-ssl.js — Self-signed SSL Certificate Generator
 * Run: node generate-ssl.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SSL_DIR = path.join(__dirname, 'ssl');
const KEY_PATH = path.join(SSL_DIR, 'key.pem');
const CERT_PATH = path.join(SSL_DIR, 'cert.pem');

console.log('\n🦊 WixFox SSL Certificate Generator\n');

// Create ssl/ directory if it doesn't exist
if (!fs.existsSync(SSL_DIR)) {
  fs.mkdirSync(SSL_DIR, { recursive: true });
  console.log('✅ Created ssl/ directory');
}

// Check if certificates already exist
if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
  console.log('⚠️  SSL certificates already exist at ssl/');
  console.log('   Delete ssl/ folder and re-run to regenerate.\n');
  process.exit(0);
}

// Generate self-signed SSL certificate (valid for 365 days)
try {
  console.log('🔐 Generating self-signed SSL certificate...');
  execSync(
    `openssl req -x509 -newkey rsa:4096 -keyout "${KEY_PATH}" -out "${CERT_PATH}" -days 365 -nodes \
    -subj "/C=IN/ST=Gujarat/L=Gandhidham/O=WixFox Digital Solutions/OU=IT/CN=wixfox.com"`,
    { stdio: 'pipe' }
  );
  console.log('✅ SSL certificate generated successfully!');
  console.log(`   Key:  ${KEY_PATH}`);
  console.log(`   Cert: ${CERT_PATH}`);
  console.log('\n🚀 You can now run: node server.js\n');
} catch (err) {
  console.error('❌ Failed to generate SSL certificate.');
  console.error('   Make sure OpenSSL is installed on your system.');
  console.error('   Install: https://www.openssl.org/\n');
  console.error(err.message);
  process.exit(1);
}
