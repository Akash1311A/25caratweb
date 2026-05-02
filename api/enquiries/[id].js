import {
  handleOptions,
  removeEnquiry,
  requireAdmin,
  setCorsHeaders,
} from '../_lib/state.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const enquiryId = decodeURIComponent(req.query.id);
  res.status(200).json(await removeEnquiry(enquiryId));
}
