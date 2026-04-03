const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// ─── Admin Portal (all staff roles) ────────────────────────────────────────────
app.use('/admin', createProxyMiddleware({
  target: 'http://127.0.0.1:5174',
  changeOrigin: true,
  ws: true,
  pathRewrite: (p, req) => req.originalUrl,
}));

// ─── Student Portal (separate) ─────────────────────────────────────────────────
app.use('/student', createProxyMiddleware({
  target: 'http://127.0.0.1:5173',
  changeOrigin: true,
  ws: true,
  pathRewrite: (p, req) => req.originalUrl,
}));

// ─── Backend API ───────────────────────────────────────────────────────────────
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  pathRewrite: (p, req) => req.originalUrl,
}));

// ─── Uploads (backend-served files) ────────────────────────────────────────────
app.use('/uploads', createProxyMiddleware({
  target: 'http://127.0.0.1:5000',
  changeOrigin: true,
  pathRewrite: (p, req) => req.originalUrl,
}));

// ─── Website (Next.js catch-all) ───────────────────────────────────────────────
app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:3001',
  changeOrigin: true,
  ws: true,
}));

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║  Language Academy Gateway · :${PORT}    ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  console.log(`  ║  Website  → localhost:${PORT}            ║`);
  console.log(`  ║  Admin    → localhost:${PORT}/admin      ║`);
  console.log(`  ║  Student  → localhost:${PORT}/student    ║`);
  console.log(`  ║  API      → localhost:${PORT}/api        ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
