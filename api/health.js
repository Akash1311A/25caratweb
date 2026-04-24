import { handleOptions, setCorsHeaders } from './_lib/state.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'GET') {
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
