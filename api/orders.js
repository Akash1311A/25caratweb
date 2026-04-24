// In-memory storage for Vercel (resets on each deployment/wake)
// For production, use a database like Supabase, MongoDB, or Redis

let orders = [];

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deploy';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload) {
  return require('crypto').createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
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

function createOrder(payload, products) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const detailedItems = items
    .map((item) => {
      const product = products.find((p) => p.id === Number(item.productId));
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

import { products } from '../src/data/content.js';

export default function handler(req, res) {
  const { method, headers } = req;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Get all orders (admin)
  if (method === 'GET' && req.url === '/api/orders') {
    const authHeader = headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!verifyToken(token)) {
      res.status(401).json({ error: 'Admin login required.' });
      return;
    }
    res.status(200).json(orders);
    return;
  }

  // Create order (public)
  if (method === 'POST' && req.url === '/api/orders') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const order = createOrder(payload, products);
        orders = [order, ...orders];
        res.status(201).json(order);
      } catch {
        res.status(400).json({ error: 'Invalid request.' });
      }
    });
    return;
  }

  // Update order status (admin)
  const orderStatusMatch = req.url && req.url.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (method === 'PATCH' && orderStatusMatch) {
    const authHeader = headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!verifyToken(token)) {
      res.status(401).json({ error: 'Admin login required.' });
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { status } = JSON.parse(body);
        const orderId = decodeURIComponent(orderStatusMatch[1]);
        orders = orders.map((order) => 
          order.id === orderId ? { ...order, status: status || order.status } : order
        );
        const updatedOrder = orders.find((o) => o.id === orderId);
        res.status(200).json(updatedOrder || null);
      } catch {
        res.status(400).json({ error: 'Invalid request.' });
      }
    });
    return;
  }

  res.status(404).json({ error: 'API route not found.' });
}