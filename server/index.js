import { createHmac, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4000);
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'data', 'store.json');
const DIST_DIR = join(__dirname, '..', 'dist');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@25carat.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deploy';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

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

const defaultDb = {
  content: defaultContent,
  orders: [],
  enquiries: [],
};

function jsonResponse(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(body);
}

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

async function staticResponse(res, filePath) {
  const body = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': getContentType(filePath) });
  res.end(body);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload) {
  return createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
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

  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!verifyToken(token)) {
    jsonResponse(res, 401, { error: 'Admin login required.' });
    return false;
  }

  return true;
}

async function readDb() {
  if (!existsSync(DB_PATH)) {
    await writeDb(defaultDb);
    return defaultDb;
  }

  const raw = await readFile(DB_PATH, 'utf8');
  const saved = JSON.parse(raw);

  return {
    ...defaultDb,
    ...saved,
    content: {
      ...defaultContent,
      ...(saved.content || {}),
    },
  };
}

async function writeDb(db) {
  await mkdir(dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function createOrder(payload, content) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const detailedItems = items
    .map((item) => {
      const product = content.products.find((entry) => entry.id === Number(item.productId));
      if (!product) return null;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      return {
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
      };
    })
    .filter(Boolean);

  const total = detailedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    id: `JF-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    customer: payload.customer || {},
    paymentMode: payload.paymentMode || 'cod',
    items: detailedItems,
    total,
    status: 'Confirmed',
  };
}

async function routeRequest(req, res) {
  if (req.method === 'OPTIONS') {
    jsonResponse(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/api/health') {
      jsonResponse(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && path === '/api/auth/login') {
      const body = await parseJsonBody(req);
      if (body.email === ADMIN_EMAIL && body.password === ADMIN_PASSWORD) {
        jsonResponse(res, 200, { token: createToken(body.email), email: body.email });
        return;
      }

      jsonResponse(res, 401, { error: 'Invalid admin credentials.' });
      return;
    }

    const db = await readDb();

    if (req.method === 'GET' && path === '/api/content') {
      jsonResponse(res, 200, db.content);
      return;
    }

    if (req.method === 'PUT' && path === '/api/content') {
      if (!requireAdmin(req, res)) return;
      const body = await parseJsonBody(req);
      const nextDb = {
        ...db,
        content: {
          ...defaultContent,
          ...body,
        },
      };
      await writeDb(nextDb);
      jsonResponse(res, 200, nextDb.content);
      return;
    }

    if (req.method === 'GET' && path === '/api/orders') {
      if (!requireAdmin(req, res)) return;
      jsonResponse(res, 200, db.orders);
      return;
    }

    if (req.method === 'POST' && path === '/api/orders') {
      const body = await parseJsonBody(req);
      const order = createOrder(body, db.content);
      const nextDb = { ...db, orders: [order, ...db.orders] };
      await writeDb(nextDb);
      jsonResponse(res, 201, order);
      return;
    }

    const orderStatusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (req.method === 'PATCH' && orderStatusMatch) {
      if (!requireAdmin(req, res)) return;
      const body = await parseJsonBody(req);
      const orderId = decodeURIComponent(orderStatusMatch[1]);
      const nextDb = {
        ...db,
        orders: db.orders.map((order) => (order.id === orderId ? { ...order, status: body.status || order.status } : order)),
      };
      await writeDb(nextDb);
      jsonResponse(res, 200, nextDb.orders.find((order) => order.id === orderId) || null);
      return;
    }

    if (req.method === 'GET' && path === '/api/enquiries') {
      if (!requireAdmin(req, res)) return;
      jsonResponse(res, 200, db.enquiries);
      return;
    }

    if (req.method === 'POST' && path === '/api/enquiries') {
      const body = await parseJsonBody(req);
      const enquiry = {
        id: `ENQ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        message: body.message || '',
      };
      const nextDb = { ...db, enquiries: [enquiry, ...db.enquiries] };
      await writeDb(nextDb);
      jsonResponse(res, 201, enquiry);
      return;
    }

    const enquiryMatch = path.match(/^\/api\/enquiries\/([^/]+)$/);
    if (req.method === 'DELETE' && enquiryMatch) {
      if (!requireAdmin(req, res)) return;
      const enquiryId = decodeURIComponent(enquiryMatch[1]);
      const nextDb = { ...db, enquiries: db.enquiries.filter((entry) => entry.id !== enquiryId) };
      await writeDb(nextDb);
      jsonResponse(res, 200, { ok: true });
      return;
    }

    if (path.startsWith('/api')) {
      jsonResponse(res, 404, { error: 'API route not found.' });
      return;
    }

    const requestedPath = path === '/' ? '/index.html' : path;
    const cleanPath = requestedPath.replace(/^\/+/, '').replace(/\.\./g, '');
    const filePath = join(DIST_DIR, cleanPath);

    if (existsSync(filePath)) {
      await staticResponse(res, filePath);
      return;
    }

    await staticResponse(res, join(DIST_DIR, 'index.html'));
  } catch (error) {
    jsonResponse(res, 500, { error: error.message || 'Server error.' });
  }
}

const server = await import('node:http').then(({ createServer }) => createServer(routeRequest));

server.listen(PORT, () => {
  console.log(`API server running at http://127.0.0.1:${PORT}`);
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
});
