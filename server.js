const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Serve all static files (HTML, CSS, JS, images) ──────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Custom error pages ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).sendFile(path.join(__dirname, '500.html'));
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🎓 NMIT CIE Hub is running!');
  console.log('');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log('');
  console.log('  Press Ctrl+C to stop the server.');
  console.log('');
});