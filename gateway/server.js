const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Portals Mapping
const portals = {
  '/admin': 'http://127.0.0.1:5174',
  '/teacher': 'http://127.0.0.1:5175',
  '/student': 'http://127.0.0.1:5173',
  '/accounting': 'http://127.0.0.1:5176',
};

// Setup Proxy for each portal
const createPortalProxy = (context, target) => createProxyMiddleware({
  pathFilter: (path) => path.startsWith(context),
  target,
  changeOrigin: true,
  ws: true,
});

app.use(createPortalProxy('/admin', 'http://localhost:5174'));
app.use(createPortalProxy('/teacher', 'http://localhost:5175'));
app.use(createPortalProxy('/student', 'http://localhost:5173'));
app.use(createPortalProxy('/accounting', 'http://localhost:5176'));
app.use('/api', createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true }));

// Website Proxy (Catch-all for root and other non-portal routes)
app.use('/', createProxyMiddleware({ 
  target: 'http://localhost:3001', 
  changeOrigin: true,
  ws: true 
}));

app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
});
