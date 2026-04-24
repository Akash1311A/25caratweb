import {
  adminStats,
  brandInfo,
  categories,
  collections,
  homeContent,
  offerMessages,
  orderTimeline,
  products,
  reviews,
  topSellerIds,
} from '../src/data/content.js';

const defaultContent = {
  products,
  categories,
  collections,
  reviews,
  topSellerIds,
  brandInfo,
  adminStats,
  orderTimeline,
  offerMessages,
  homeContent,
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@25carat.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deploy';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload) {
  return require('crypto').createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
}

function createToken(email) {
  const payload = base64url(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${signPayload(payload)}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  const expected = signPayload(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !require('crypto').timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return false;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export default function handler(req, res) {
  const { method, headers } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Health check
  if (method === 'GET' && req.url === '/api/health') {
    res.status(200).json({ ok: true });
    return;
  }

  // Login
  if (method === 'POST' && (req.url === '/api/auth/login' || req.url === '/api/login')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          res.status(200).json({ token: createToken(email), email });
        } else {
          res.status(401).json({ error: 'Invalid admin credentials.' });
        }
      } catch {
        res.status(400).json({ error: 'Invalid request.' });
      }
    });
    return;
  }

  // Content (public)
  if (method === 'GET' && req.url === '/api/content') {
    res.status(200).json(defaultContent);
    return;
  }

  // Products (public)
  if (method === 'GET' && req.url === '/api/products') {
    res.status(200).json(defaultContent.products);
    return;
  }

  // Require admin for other routes
  const authHeader = headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Admin login required.' });
    return;
  }

  // Save products (admin only)
  if (method === 'PUT' && req.url === '/api/products') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { products } = JSON.parse(body);
        res.status(200).json(products);
      } catch {
        res.status(400).json({ error: 'Invalid request.' });
      }
    });
    return;
  }

  // Save content (admin only)
  if (method === 'PUT' && req.url === '/api/content') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const content = JSON.parse(body);
        res.status(200).json({ ...defaultContent, ...content });
      } catch {
        res.status(400).json({ error: 'Invalid request.' });
      }
    });
    return;
  }

  res.status(404).json({ error: 'API route not found.' });
}