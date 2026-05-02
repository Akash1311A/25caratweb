import {
  addAdminUser,
  getAdminUsers,
  handleOptions,
  readJsonBody,
  requireAdmin,
  setCorsHeaders,
} from '../_lib/state.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (!requireAdmin(req, res)) {
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json(getAdminUsers());
    return;
  }

  if (req.method === 'POST') {
    readJsonBody(req)
      .then((body) => {
        res.status(201).json(addAdminUser(body));
      })
      .catch((error) => {
        const message = error?.message || 'Invalid request.';
        res.status(message.includes('exists') ? 409 : 400).json({ error: message });
      });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
