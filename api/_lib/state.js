import { createHmac, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'admin@25carat.local').trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'admin123').trim();
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deploy';
const PASSWORD_SECRET = process.env.PASSWORD_SECRET || JWT_SECRET;
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

function readDeployedStore() {
  const storePath = join(process.cwd(), 'data', 'store.json');
  if (!existsSync(storePath)) return {};

  try {
    return JSON.parse(readFileSync(storePath, 'utf8'));
  } catch {
    return {};
  }
}

function normalizeAdminEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function hashPassword(password) {
  return createHmac('sha256', PASSWORD_SECRET).update(String(password || '').trim()).digest('base64url');
}

function passwordsMatch(password, passwordHash) {
  const expected = Buffer.from(String(passwordHash || ''));
  const candidate = Buffer.from(hashPassword(password));
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

function sanitizeAdminUser(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role || 'admin',
    createdAt: admin.createdAt,
  };
}

const deployedStore = readDeployedStore();
const deployedContent = deployedStore.content || {};
const defaultAdmins = [
    {
      id: 'admin-default',
      name: 'Primary Admin',
      email: normalizeAdminEmail(ADMIN_EMAIL),
      passwordHash: hashPassword(ADMIN_PASSWORD),
      role: 'owner',
      createdAt: '2026-05-01T00:00:00.000Z',
    },
  ];

const state = {
  content: structuredClone({
    ...defaultContent,
    ...deployedContent,
    brandInfo: {
      ...defaultContent.brandInfo,
      ...(deployedContent.brandInfo || {}),
    },
    homeContent: {
      ...defaultContent.homeContent,
      ...(deployedContent.homeContent || {}),
    },
  }),
  orders: Array.isArray(deployedStore.orders) ? deployedStore.orders : [],
  enquiries: Array.isArray(deployedStore.enquiries) ? deployedStore.enquiries : [],
  admins: Array.isArray(deployedStore.admins) && deployedStore.admins.length ? deployedStore.admins : defaultAdmins,
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
  return state.admins.some(
    (admin) => admin.email === normalizeAdminEmail(email) && passwordsMatch(password, admin.passwordHash),
  );
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

export function getAdminUsers() {
  return state.admins.map(sanitizeAdminUser);
}

export function addAdminUser(payload) {
  const email = normalizeAdminEmail(payload.email);
  const password = String(payload.password || '').trim();

  if (!payload.name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  if (state.admins.some((admin) => admin.email === email)) {
    throw new Error('An admin with this email already exists.');
  }

  const nextAdmin = {
    id: `admin-${Date.now()}`,
    name: String(payload.name).trim(),
    email,
    passwordHash: hashPassword(password),
    role: payload.role === 'owner' ? 'owner' : 'admin',
    createdAt: new Date().toISOString(),
  };

  state.admins = [nextAdmin, ...state.admins];
  return sanitizeAdminUser(nextAdmin);
}

export function deleteAdminUser(adminId) {
  if (state.admins.length <= 1) {
    throw new Error('At least one admin account must remain.');
  }

  const exists = state.admins.some((admin) => admin.id === adminId);
  if (!exists) {
    throw new Error('Admin account not found.');
  }

  state.admins = state.admins.filter((admin) => admin.id !== adminId);
  return { ok: true };
}
