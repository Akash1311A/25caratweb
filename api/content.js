import {
  getContent,
  handleOptions,
  readJsonBody,
  requireAdmin,
  setContent,
  setCorsHeaders,
} from './_lib/state.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'GET') {
    res.status(200).json(await getContent());
    return;
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const body = await readJsonBody(req);
      res.status(200).json(await setContent(body));
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Invalid request.' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
