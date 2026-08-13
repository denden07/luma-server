import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import forge from 'node-forge';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import eventsRouter from './routes/events.js';
import participantsRouter from './routes/participants.js';
import photosRouter from './routes/photos.js';
import hostsRouter from './routes/hosts.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Generate or load self-signed certificate
function ensureCertificate(): { cert: string; key: string } {
  const certPath = './ssl-cert.pem';
  const keyPath = './ssl-key.pem';
  
  if (existsSync(certPath) && existsSync(keyPath)) {
    console.log('📜 Loading existing certificate...');
    return {
      cert: readFileSync(certPath, 'utf8'),
      key: readFileSync(keyPath, 'utf8')
    };
  }
  
  console.log('📜 Generating self-signed certificate...');
  
  // Generate a key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);
  
  // Create a certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [{
    name: 'commonName',
    value: '192.168.1.90'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  
  // Self-sign certificate
  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  // Convert to PEM format
  const certPem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);
  
  // Save to files
  writeFileSync(certPath, certPem);
  writeFileSync(keyPath, keyPem);
  
  console.log('✅ Certificate generated successfully');
  
  return {
    cert: certPem,
    key: keyPem
  };
}

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local development
  credentials: true
}));

// Body parsers - SKIP for multipart/form-data (handled by busboy in routes)
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('multipart/form-data')) {
    console.log('[Middleware] Skipping body parsers for multipart request');
    return next(); // Skip JSON/urlencoded parsing for multipart
  }
  
  // Apply body parsers for non-multipart requests
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
  });
});

// Log ALL incoming requests before any parsing
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[RAW REQUEST] ${req.method} ${req.url}`, {
    headers: req.headers,
    contentLength: req.headers['content-length'],
    contentType: req.headers['content-type']
  });
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[REQUEST COMPLETE] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_DIR));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    query: req.query,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  });
  next();
});

// API Routes
console.log('[Server] Registering routes...');
app.use('/api/hosts', hostsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/events', participantsRouter);
app.use('/api/events', (req, res, next) => {
  console.log('[Router Debug] Request to /api/events/*:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
  next();
}, photosRouter);
app.use('/api/photos', photosRouter);
console.log('[Server] Routes registered successfully');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error] ❌❌❌', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.path
  });
});

// Start server
if (USE_HTTPS) {
  // For local development with mobile testing - use HTTPS with self-signed cert
  const credentials = ensureCertificate();
  
  https.createServer(credentials, app).listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 madetogether server running on https://0.0.0.0:${PORT}`);
    console.log(`📱 Network access: https://192.168.1.90:${PORT}`);
    console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/madetogether'}`);
    console.log(`\n⚠️  Using self-signed certificate - IMPORTANT STEPS FOR iPHONE:`);
    console.log(`   1. Open Safari on iPhone and go to: https://192.168.1.90:${PORT}/api/health`);
    console.log(`   2. Tap "Show Details" → "visit this website" → "Visit Website"`);
    console.log(`   3. After accepting the certificate, reload your app\n`);
  });
} else {
  // Regular HTTP server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 madetogether server running on http://localhost:${PORT}`);
    console.log(`📱 Network access: http://192.168.1.90:${PORT}`);
    console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/madetogether'}`);
  });
}
