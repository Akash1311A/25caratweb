import {
  handleOptions,
  readJsonBody,
  requireAdmin,
  setCorsHeaders,
  updateOrderStatus,
} from '../../_lib/state.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const body = await readJsonBody(req);
    const orderId = decodeURIComponent(req.query.id);
    res.status(200).json(await updateOrderStatus(orderId, body.status));
  } catch (error) {
    res.status(400).json({ error: error?.message || 'Invalid request.' });
  }
}
