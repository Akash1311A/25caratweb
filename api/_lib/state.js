import { createHmac, timingSafeEqual } from 'node:crypto';
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
} from '../../src/data/content.js';

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

const state = {
  content: structuredClone(defaultContent),
  orders: [],
  enquiries: [],
};

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload) {
  return createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
}

export function createToken(email) {
  const payload = base64url(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${signPayload(payload)}`;
}

export function verifyAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function verifyToken(token) {
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

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(204).end();
    return true;
  }

  return false;
}

export async function readJsonBody(req) {
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
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
        reject(new Error('Invalid request.'));
      }
    });

    req.on('error', reject);
  });
}

export function requireAdmin(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!verifyToken(token)) {
    setCorsHeaders(res);
    res.status(401).json({ error: 'Admin login required.' });
    return false;
  }

  return true;
}

export function getContent() {
  return state.content;
}

export function setContent(nextContent) {
  state.content = { ...state.content, ...nextContent };
  return state.content;
}

export function getProducts() {
  return state.content.products;
}

export function setProducts(nextProducts) {
  state.content = {
    ...state.content,
    products: nextProducts,
  };
  return state.content.products;
}

export function getOrders() {
  return state.orders;
}

export function addOrder(payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const detailedItems = items
    .map((item) => {
      const product = state.content.products.find((entry) => entry.id === Number(item.productId));
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
  const order = {
    id: `JF-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    customer: payload.customer || {},
    paymentMode: payload.paymentMode || 'cod',
    items: detailedItems,
    total,
    status: 'Confirmed',
  };

  state.orders = [order, ...state.orders];
  return order;
}

export function updateOrderStatus(orderId, status) {
  state.orders = state.orders.map((order) =>
    order.id === orderId ? { ...order, status: status || order.status } : order,
  );

  return state.orders.find((order) => order.id === orderId) || null;
}

export function getEnquiries() {
  return state.enquiries;
}

export function addEnquiry(payload) {
  const enquiry = {
    id: `ENQ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    message: payload.message || '',
  };

  state.enquiries = [enquiry, ...state.enquiries];
  return enquiry;
}

export function removeEnquiry(enquiryId) {
  state.enquiries = state.enquiries.filter((entry) => entry.id !== enquiryId);
  return { ok: true };
}
