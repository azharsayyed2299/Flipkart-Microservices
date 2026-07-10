const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-long-random-secret';

const SERVICES = {
  USER: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  PRODUCT: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  CART: process.env.CART_SERVICE_URL || 'http://localhost:3003',
  ORDER: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  PAYMENT: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006'
};

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: 'draft-7',
  legacyHeaders: false
}));

function isProtectedRoute(req) {
  const path = req.path;
  if (req.method === 'OPTIONS') return false;
  if (path === '/health' || path === '/api/health') return false;

  if (path.startsWith('/api/users')) {
    const isAuthRoute = req.method === 'POST' && (
      path === '/api/users/register' || path === '/api/users/login'
    );
    return !isAuthRoute;
  }

  if (path.startsWith('/api/products')) {
    return !['GET', 'HEAD'].includes(req.method);
  }

  return ['/api/cart', '/api/orders', '/api/payments', '/api/notifications']
    .some((prefix) => path.startsWith(prefix));
}

app.use((req, res, next) => {
  if (!isProtectedRoute(req)) return next();

  const token = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication token is required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-role'] = decoded.role || 'user';
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

async function checkService(name, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${url}/health`, { signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { name, url, ok: response.ok, statusCode: response.status, data };
  } catch (error) {
    return { name, url, ok: false, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

app.get(['/health', '/api/health'], async (req, res) => {
  const checks = await Promise.all(Object.entries(SERVICES).map(([name, url]) => checkService(name, url)));
  const allHealthy = checks.every((service) => service.ok);
  res.status(allHealthy ? 200 : 207).json({
    status: allHealthy ? 'ok' : 'degraded',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: checks
  });
});

function proxyOptions(target, prefix) {
  return {
    target,
    changeOrigin: true,
    pathRewrite(path) {
      const rewritten = path.replace(new RegExp(`^${prefix}`), '');
      return rewritten || '/';
    },
    onProxyReq: fixRequestBody,
    proxyTimeout: 30000,
    timeout: 30000,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    onError(error, req, res) {
      console.error(`Proxy error for ${req.method} ${req.originalUrl}:`, error.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Bad gateway',
          message: 'The upstream service is unavailable',
          service: target
        });
      }
    }
  };
}

app.use('/api/users', createProxyMiddleware(proxyOptions(SERVICES.USER, '/api/users')));
app.use('/api/products', createProxyMiddleware(proxyOptions(SERVICES.PRODUCT, '/api/products')));
app.use('/api/cart', createProxyMiddleware(proxyOptions(SERVICES.CART, '/api/cart')));
app.use('/api/orders', createProxyMiddleware(proxyOptions(SERVICES.ORDER, '/api/orders')));
app.use('/api/payments', createProxyMiddleware(proxyOptions(SERVICES.PAYMENT, '/api/payments')));
app.use('/api/notifications', createProxyMiddleware(proxyOptions(SERVICES.NOTIFICATION, '/api/notifications')));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.use((error, req, res, next) => {
  console.error('Gateway error:', error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
