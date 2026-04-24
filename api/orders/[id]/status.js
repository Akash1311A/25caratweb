import {
  handleOptions,
  readJsonBody,
  requireAdmin,
  setCorsHeaders,
  updateOrderStatus,
} from '../../_lib/state.js';

export default function handler(req, res) {
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

  readJsonBody(req)
    .then((body) => {
      const orderId = decodeURIComponent(req.query.id);
      res.status(200).json(updateOrderStatus(orderId, body.status));
    })
    .catch(() => {
      res.status(400).json({ error: 'Invalid request.' });
    });
}
