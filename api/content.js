import {
  getContent,
  handleOptions,
  readJsonBody,
  requireAdmin,
  setContent,
  setCorsHeaders,
} from './_lib/state.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'GET') {
    res.status(200).json(getContent());
    return;
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) {
      return;
    }

    readJsonBody(req)
      .then((body) => {
        res.status(200).json(setContent(body));
      })
      .catch(() => {
        res.status(400).json({ error: 'Invalid request.' });
      });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
