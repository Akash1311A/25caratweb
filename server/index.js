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
const UPLOAD_DIR = join(__dirname, '..', 'public', 'uploads');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@25carat.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
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

function parseMultipartBoundary(contentType) {
  const match = String(contentType || '').match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? match[1] || match[2] : '';
}

function getUploadExtension(contentType, filename) {
  const lowerName = String(filename || '').toLowerCase();
  if (lowerName.endsWith('.png')) return '.png';
  if (lowerName.endsWith('.webp')) return '.webp';
  if (lowerName.endsWith('.gif')) return '.gif';
  if (lowerName.endsWith('.svg')) return '.svg';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return '.jpg';
  if (contentType === 'image/png') return '.png';
  if (contentType === 'image/webp') return '.webp';
  if (contentType === 'image/gif') return '.gif';
  if (contentType === 'image/svg+xml') return '.svg';
  return '.jpg';
}

function parseMultipartFile(buffer, boundary) {
  const boundaryText = `--${boundary}`;
  const body = buffer.toString('binary');
  const parts = body.split(boundaryText);

  for (const part of parts) {
    if (!part.includes('name="image"')) continue;

    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const rawHeaders = part.slice(0, headerEnd);
    const filename = rawHeaders.match(/filename="([^"]*)"/i)?.[1] || '';
    const contentType = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]?.trim() || '';
    let fileBody = part.slice(headerEnd + 4);

    if (fileBody.endsWith('\r\n')) {
      fileBody = fileBody.slice(0, -2);
    }

    return {
      filename,
      contentType,
      buffer: Buffer.from(fileBody, 'binary'),
    };
  }

  return null;
}

function readMultipartFile(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const maxSize = 10 * 1024 * 1024;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        req.destroy();
        reject(new Error('Image must be smaller than 10 MB.'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const boundary = parseMultipartBoundary(req.headers['content-type']);
      if (!boundary) {
        reject(new Error('Invalid image upload.'));
        return;
      }

      const file = parseMultipartFile(Buffer.concat(chunks), boundary);
      if (!file?.buffer?.length || !file.contentType.startsWith('image/')) {
        reject(new Error('Please upload a valid image file.'));
        return;
      }

      resolve(file);
    });

    req.on('error', reject);
  });
}

async function handleImageUpload(req, res) {
  const file = await readMultipartFile(req);
  const extension = getUploadExtension(file.contentType, file.filename);
  const safeName = `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, safeName), file.buffer);

  jsonResponse(res, 201, {
    url: `/uploads/${safeName}`,
    filename: safeName,
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

function decodeToken(token) {
  if (!verifyToken(token)) return null;

  try {
    const [payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
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

function getAuthenticatedAdmin(req, db) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = decodeToken(token);
  if (!payload?.email) return null;
  return (db.admins || []).find((admin) => admin.email === normalizeAdminEmail(payload.email)) || null;
}

async function readDb() {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      return await readSupabaseDb();
    } catch (error) {
      console.warn(`Supabase read failed, using file fallback: ${error.message}`);
    }
  }

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

async function writeDb(db) {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      await writeSupabaseDb(db);
      return;
    } catch (error) {
      console.warn(`Supabase write failed, using file fallback: ${error.message}`);
    }
  }

  await mkdir(dirname(DB_PATH), { recursive: true });
  if (existsSync(DB_PATH)) {
    const backupDir = join(dirname(DB_PATH), 'backups');
    const backupName = `store-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    await mkdir(backupDir, { recursive: true });
    await writeFile(join(backupDir, backupName), await readFile(DB_PATH, 'utf8'));
  }
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function normalizeDb(saved) {
  return {
    ...defaultDb,
    ...saved,
    content: {
      ...defaultContent,
      ...(saved.content || {}),
    },
    orders: Array.isArray(saved.orders) ? saved.orders : [],
    enquiries: Array.isArray(saved.enquiries) ? saved.enquiries : [],
  };
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
    await writeSupabaseDb(defaultDb);
    return defaultDb;
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

    if (req.method === 'POST' && path === '/api/uploads') {
      if (!requireAdmin(req, res)) return;
      await handleImageUpload(req, res);
      return;
    }

    const db = await readDb();

    if (req.method === 'POST' && (path === '/api/auth/login' || path === '/api/login')) {
      const body = await parseJsonBody(req);
      const admin = db.admins.find(
        (entry) => entry.email === normalizeAdminEmail(body.email) && passwordsMatch(body.password, entry.passwordHash),
      );

      if (admin) {
        jsonResponse(res, 200, {
          token: createToken(admin.email),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        });
        return;
      }

      jsonResponse(res, 401, { error: 'Invalid admin credentials.' });
      return;
    }

    if (req.method === 'GET' && path === '/api/content') {
      jsonResponse(res, 200, db.content);
      return;
    }

    if (req.method === 'GET' && path === '/api/products') {
      jsonResponse(res, 200, db.content.products);
      return;
    }

    if (req.method === 'PUT' && path === '/api/products') {
      if (!requireAdmin(req, res)) return;
      const body = await parseJsonBody(req);
      const nextProducts = Array.isArray(body) ? body : body.products;
      if (!Array.isArray(nextProducts)) {
        jsonResponse(res, 400, { error: 'Products array required.' });
        return;
      }

      const nextDb = {
        ...db,
        content: {
          ...db.content,
          products: nextProducts,
        },
      };
      await writeDb(nextDb);
      jsonResponse(res, 200, nextDb.content.products);
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

    if (req.method === 'GET' && (path === '/api/enquiries' || path === '/api/enquiry')) {
      if (!requireAdmin(req, res)) return;
      jsonResponse(res, 200, db.enquiries);
      return;
    }

    if (req.method === 'POST' && (path === '/api/enquiries' || path === '/api/enquiry')) {
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

    if (req.method === 'GET' && path === '/api/admin/users') {
      if (!requireAdmin(req, res)) return;
      jsonResponse(res, 200, db.admins.map(sanitizeAdminUser));
      return;
    }

    if (req.method === 'POST' && path === '/api/admin/users') {
      if (!requireAdmin(req, res)) return;

      const actor = getAuthenticatedAdmin(req, db);
      if (!actor) {
        jsonResponse(res, 401, { error: 'Admin login required.' });
        return;
      }

      const body = await parseJsonBody(req);
      const email = normalizeAdminEmail(body.email);
      const password = String(body.password || '').trim();

      if (!body.name || !email || !password) {
        jsonResponse(res, 400, { error: 'Name, email, and password are required.' });
        return;
      }

      if (db.admins.some((admin) => admin.email === email)) {
        jsonResponse(res, 409, { error: 'An admin with this email already exists.' });
        return;
      }

      const nextAdmin = {
        id: `admin-${Date.now()}`,
        name: String(body.name).trim(),
        email,
        passwordHash: hashPassword(password),
        role: body.role === 'owner' ? 'owner' : 'admin',
        createdAt: new Date().toISOString(),
      };

      const nextDb = {
        ...db,
        admins: [nextAdmin, ...db.admins],
      };
      await writeDb(nextDb);
      jsonResponse(res, 201, sanitizeAdminUser(nextAdmin));
      return;
    }

    const adminMatch = path.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (req.method === 'DELETE' && adminMatch) {
      if (!requireAdmin(req, res)) return;

      const actor = getAuthenticatedAdmin(req, db);
      if (!actor) {
        jsonResponse(res, 401, { error: 'Admin login required.' });
        return;
      }

      const adminId = decodeURIComponent(adminMatch[1]);
      const target = db.admins.find((admin) => admin.id === adminId);

      if (!target) {
        jsonResponse(res, 404, { error: 'Admin account not found.' });
        return;
      }

      if (db.admins.length <= 1) {
        jsonResponse(res, 400, { error: 'At least one admin account must remain.' });
        return;
      }

      const nextDb = {
        ...db,
        admins: db.admins.filter((admin) => admin.id !== adminId),
      };
      await writeDb(nextDb);
      jsonResponse(res, 200, { ok: true });
      return;
    }

    if (path.startsWith('/api')) {
      jsonResponse(res, 404, { error: 'API route not found.' });
      return;
    }

    if (path.startsWith('/uploads/')) {
      const uploadName = path.replace(/^\/uploads\/+/, '').replace(/\.\./g, '');
      const uploadPath = join(UPLOAD_DIR, uploadName);

      if (existsSync(uploadPath)) {
        await staticResponse(res, uploadPath);
        return;
      }
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
