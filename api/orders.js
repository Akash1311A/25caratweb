import {
  addOrder,
  getOrders,
  handleOptions,
  readJsonBody,
  requireAdmin,
  setCorsHeaders,
} from './_lib/state.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) {
      return;
    }
    res.status(200).json(await getOrders());
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      res.status(201).json(await addOrder(body));
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Invalid request.' });
    }
    return;
  }

  res.status(404).json({ error: 'API route not found.' });
}
