const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Maintenance mode — set to true to show 503 to all visitors ───────────────
const MAINTENANCE_MODE = false;

// ── Simple token for the /admin route (change this!) ────────────────────────
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'nmit-secret';

// ── Middleware: maintenance check (runs before everything) ───────────────────
app.use((req, res, next) => {
  // Allow the 503 page itself and its assets through
  if (MAINTENANCE_MODE && req.path !== '/503.html') {
    return res.status(503).sendFile(path.join(__dirname, '503.html'));
  }
  next();
});

// ── Middleware: parse JSON bodies ────────────────────────────────────────────
app.use(express.json());

// ── Middleware: simple token-based auth guard ────────────────────────────────
//    Protects any route under /admin/*
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(403).sendFile(path.join(__dirname, '403.html'));
  }
  next();
}

// ── Static files (HTML, CSS, JS) ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Routes ───────────────────────────────────────────────────────────────────

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Protected admin route — triggers 403 without the correct token
// Test: visit http://localhost:3000/admin
// Pass:  http://localhost:3000/admin?token=nmit-secret
app.get('/admin', requireAuth, (req, res) => {
  res.json({ message: 'Welcome, admin!', status: 'ok' });
});

// Test route that deliberately crashes — triggers 500
// Visit: http://localhost:3000/test-500
app.get('/test-500', (req, res, next) => {
  next(new Error('Deliberate test crash — 500 error page check'));
});

// Test route for offline/network errors — triggers 503
// Visit: http://localhost:3000/test-503
app.get('/test-503', (req, res) => {
  res.status(503).sendFile(path.join(__dirname, '503.html'));
});

// ── Error handlers (must be last) ────────────────────────────────────────────

// 404 — no route matched
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// 500 — something threw an error
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
  console.log(`  Admin:      http://localhost:${PORT}/admin?token=${ADMIN_TOKEN}`);
  console.log(`  Test 403:   http://localhost:${PORT}/admin`);
  console.log(`  Test 404:   http://localhost:${PORT}/anything-unknown`);
  console.log(`  Test 500:   http://localhost:${PORT}/test-500`);
  console.log(`  Test 503:   http://localhost:${PORT}/test-503`);
  console.log('');
  console.log(`  Maintenance mode: ${MAINTENANCE_MODE ? '🔴 ON' : '🟢 OFF'}`);
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});