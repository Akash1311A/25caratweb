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
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_STATE_TABLE = process.env.SUPABASE_STATE_TABLE || 'app_state';
const SUPABASE_STATE_KEY = process.env.SUPABASE_STATE_KEY || 'main';

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

function buildDefaultAdmin() {
  return {
    id: 'admin-default',
    name: 'Primary Admin',
    email: normalizeAdminEmail(ADMIN_EMAIL),
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: 'owner',
    createdAt: '2026-05-01T00:00:00.000Z',
  };
}

const defaultDb = {
  content: defaultContent,
  orders: [],
  enquiries: [],
  admins: [buildDefaultAdmin()],
};

function normalizeDb(saved = {}) {
  const savedContent = saved.content || {};

  return {
    ...defaultDb,
    ...saved,
    content: {
      ...defaultContent,
      ...savedContent,
      brandInfo: {
        ...defaultContent.brandInfo,
        ...(savedContent.brandInfo || {}),
      },
      homeContent: {
        ...defaultContent.homeContent,
        ...(savedContent.homeContent || {}),
      },
    },
    orders: Array.isArray(saved.orders) ? saved.orders : [],
    enquiries: Array.isArray(saved.enquiries) ? saved.enquiries : [],
    admins: Array.isArray(saved.admins) && saved.admins.length
      ? saved.admins.map((admin) => ({
          id: admin.id || `admin-${Date.now()}`,
          name: admin.name || 'Admin',
          email: normalizeAdminEmail(admin.email),
          passwordHash: admin.passwordHash || hashPassword(ADMIN_PASSWORD),
          role: admin.role || 'admin',
          createdAt: admin.createdAt || new Date().toISOString(),
        }))
      : [buildDefaultAdmin()],
  };
}

const deployedStore = readDeployedStore();
let memoryDb = normalizeDb(deployedStore);

function hasSupabaseConfig() {
  return (
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY &&
    !SUPABASE_URL.includes('your-project') &&
    !SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role-key')
  );
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Supabase request failed: ${response.status}`);
  }

  return data;
}

async function readSupabaseDb() {
  const rows = await supabaseRequest(
    `${SUPABASE_STATE_TABLE}?key=eq.${encodeURIComponent(SUPABASE_STATE_KEY)}&select=value`,
  );

  if (!rows?.length) {
    await writeSupabaseDb(memoryDb);
    return memoryDb;
  }

  return normalizeDb(rows[0].value || {});
}

async function writeSupabaseDb(db) {
  await supabaseRequest(`${SUPABASE_STATE_TABLE}?on_conflict=key`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      key: SUPABASE_STATE_KEY,
      value: normalizeDb(db),
      updated_at: new Date().toISOString(),
    }),
  });
}

async function readDb() {
  if (hasSupabaseConfig()) {
    try {
      memoryDb = await readSupabaseDb();
    } catch (error) {
      console.warn(`Supabase read failed, using deployed fallback: ${error.message}`);
    }
  }

  return memoryDb;
}

async function writeDb(db) {
  memoryDb = normalizeDb(db);

  if (hasSupabaseConfig()) {
    try {
      await writeSupabaseDb(memoryDb);
    } catch (error) {
      console.warn(`Supabase write failed, keeping warm-memory fallback: ${error.message}`);
      throw error;
    }
  }

  return memoryDb;
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload) {
  return createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
}

export function createToken(email) {
  const payload = base64url(JSON.stringify({ email: normalizeAdminEmail(email), exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${signPayload(payload)}`;
}

export async function verifyAdminCredentials(email, password) {
  const db = await readDb();
  return db.admins.some(
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

export async function getContent() {
  const db = await readDb();
  return db.content;
}

export async function setContent(nextContent) {
  const db = await readDb();
  const nextDb = {
    ...db,
    content: {
      ...defaultContent,
      ...db.content,
      ...nextContent,
    },
  };
  return (await writeDb(nextDb)).content;
}

export async function getProducts() {
  const db = await readDb();
  return db.content.products;
}

export async function setProducts(nextProducts) {
  const db = await readDb();
  const nextDb = {
    ...db,
    content: {
      ...db.content,
      products: nextProducts,
    },
  };
  return (await writeDb(nextDb)).content.products;
}

export async function getOrders() {
  const db = await readDb();
  return db.orders;
}

export async function addOrder(payload) {
  const db = await readDb();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const detailedItems = items
    .map((item) => {
      const product = db.content.products.find((entry) => entry.id === Number(item.productId));
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

  const nextDb = {
    ...db,
    orders: [order, ...db.orders],
  };
  await writeDb(nextDb);
  return order;
}

export async function updateOrderStatus(orderId, status) {
  const db = await readDb();
  const nextDb = {
    ...db,
    orders: db.orders.map((order) => (order.id === orderId ? { ...order, status: status || order.status } : order)),
  };

  const saved = await writeDb(nextDb);
  return saved.orders.find((order) => order.id === orderId) || null;
}

export async function getEnquiries() {
  const db = await readDb();
  return db.enquiries;
}

export async function addEnquiry(payload) {
  const db = await readDb();
  const enquiry = {
    id: `ENQ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: payload.name || '',
    email: payload.email || '',
    phone: payload.phone || '',
    message: payload.message || '',
  };

  const nextDb = {
    ...db,
    enquiries: [enquiry, ...db.enquiries],
  };
  await writeDb(nextDb);
  return enquiry;
}

export async function removeEnquiry(enquiryId) {
  const db = await readDb();
  await writeDb({
    ...db,
    enquiries: db.enquiries.filter((entry) => entry.id !== enquiryId),
  });
  return { ok: true };
}

export async function getAdminUsers() {
  const db = await readDb();
  return db.admins.map(sanitizeAdminUser);
}

export async function addAdminUser(payload) {
  const db = await readDb();
  const email = normalizeAdminEmail(payload.email);
  const password = String(payload.password || '').trim();

  if (!payload.name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  if (db.admins.some((admin) => admin.email === email)) {
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

  await writeDb({
    ...db,
    admins: [nextAdmin, ...db.admins],
  });
  return sanitizeAdminUser(nextAdmin);
}

export async function deleteAdminUser(adminId) {
  const db = await readDb();

  if (db.admins.length <= 1) {
    throw new Error('At least one admin account must remain.');
  }

  const exists = db.admins.some((admin) => admin.id === adminId);
  if (!exists) {
    throw new Error('Admin account not found.');
  }

  await writeDb({
    ...db,
    admins: db.admins.filter((admin) => admin.id !== adminId),
  });
  return { ok: true };
}
