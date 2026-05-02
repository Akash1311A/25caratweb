import {
  deleteAdminUser,
  handleOptions,
  requireAdmin,
  setCorsHeaders,
} from '../../_lib/state.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (!requireAdmin(req, res)) {
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const adminId = req.query?.id || req.url?.split('/').filter(Boolean).pop();

  try {
    res.status(200).json(await deleteAdminUser(String(adminId || '')));
  } catch (error) {
    const message = error?.message || 'Invalid request.';
    const status = message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: message });
  }
}
