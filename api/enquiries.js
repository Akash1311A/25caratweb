// In-memory storage for enquiries (resets on each deployment/wake)
// For production, use a database

let enquiries = [];

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deploy';

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

export default function handler(req, res) {
  const { method, headers } = req;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Get all enquiries (admin)
  if (method === 'GET' && (req.url === '/api/enquiries' || req.url === '/api/enquiry')) {
    const authHeader = headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!verifyToken(token)) {
      res.status(401).json({ error: 'Admin login required.' });
      return;
    }
    res.status(200).json(enquiries);
    return;
  }

  // Create enquiry (public)
  if (method === 'POST' && (req.url === '/api/enquiries' || req.url === '/api/enquiry')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { name, email, phone, message } = JSON.parse(body);
        const enquiry = {
          id: `ENQ-${Date.now()}`,
          createdAt: new Date().toISOString(),
          name: name || '',
          email: email || '',
          phone: phone || '',
          message: message || '',
        };
        enquiries = [enquiry, ...enquiries];
        res.status(201).json(enquiry);
      } catch {
        res.status(400).json({ error: 'Invalid request.' });
      }
    });
    return;
  }

  // Delete enquiry (admin)
  const enquiryMatch = req.url && req.url.match(/^\/api\/enquiries\/([^/]+)$/);
  if (method === 'DELETE' && enquiryMatch) {
    const authHeader = headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!verifyToken(token)) {
      res.status(401).json({ error: 'Admin login required.' });
      return;
    }
    
    const enquiryId = decodeURIComponent(enquiryMatch[1]);
    enquiries = enquiries.filter((e) => e.id !== enquiryId);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(404).json({ error: 'API route not found.' });
}