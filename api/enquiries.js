import {
  addEnquiry,
  getEnquiries,
  handleOptions,
  readJsonBody,
  requireAdmin,
  setCorsHeaders,
} from './_lib/state.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) {
      return;
    }
    res.status(200).json(getEnquiries());
    return;
  }

  if (req.method === 'POST') {
    readJsonBody(req)
      .then((body) => {
        res.status(201).json(addEnquiry(body));
      })
      .catch(() => {
        res.status(400).json({ error: 'Invalid request.' });
      });
    return;
  }

  res.status(404).json({ error: 'API route not found.' });
}
