require('dotenv').config();

const express   = require('express');
const path      = require('path');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Config (all secrets from .env) ───────────────────────────────────────────
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const ADMIN_TOKEN      = process.env.ADMIN_TOKEN || 'nmit-secret';

// ── Security: Helmet (secure HTTP headers) ────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        styleSrc:    ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
        fontSrc:     ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
        imgSrc:      ["'self'", 'data:'],
        connectSrc:  ["'self'"],
      },
    },
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General limiter — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests — please try again later.',
  handler: (req, res) => {
    res.status(429).sendFile(path.join(__dirname, 'offline.html'));
  },
});

// Strict limiter for sensitive routes — 10 requests per 15 minutes per IP
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).sendFile(path.join(__dirname, '403.html'));
  },
});

app.use(generalLimiter);
app.use('/admin', strictLimiter);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// Maintenance mode — flip MAINTENANCE_MODE=true in .env to block all visitors
app.use((req, res, next) => {
  if (MAINTENANCE_MODE && req.path !== '/503.html') {
    return res.status(503).sendFile(path.join(__dirname, '503.html'));
  }
  next();
});

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(403).sendFile(path.join(__dirname, '403.html'));
  }
  next();
}

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Protected — visit /admin without token → 403
// Visit /admin?token=your-token → welcome
app.get('/admin', requireAuth, (req, res) => {
  res.json({ message: 'Welcome, admin!', status: 'ok' });
});

// Test routes
app.get('/test-500', (req, res, next) => {
  next(new Error('Deliberate test crash — 500 error page check'));
});

app.get('/test-503', (req, res) => {
  res.status(503).sendFile(path.join(__dirname, '503.html'));
});

// ── Error handlers ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.use((err, req, res, next) => {
  console.error('\n  ❌ Server error:', err.message);
  console.error(err.stack, '\n');
  res.status(500).sendFile(path.join(__dirname, '500.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🎓 NMIT CIE Hub is running!');
  console.log('');
  console.log(`  Local:      http://localhost:${PORT}`);
  console.log(`  Admin:      http://localhost:${PORT}/admin?token=<your-token>`);
  console.log(`  Test 403:   http://localhost:${PORT}/admin`);
  console.log(`  Test 404:   http://localhost:${PORT}/anything-unknown`);
  console.log(`  Test 500:   http://localhost:${PORT}/test-500`);
  console.log(`  Test 503:   http://localhost:${PORT}/test-503`);
  console.log('');
  console.log(`  Maintenance mode: ${MAINTENANCE_MODE ? '🔴 ON' : '🟢 OFF'}`);
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});