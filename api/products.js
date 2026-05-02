import {
  getProducts,
  handleOptions,
  readJsonBody,
  requireAdmin,
  setCorsHeaders,
  setProducts,
} from './_lib/state.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'GET') {
    res.status(200).json(await getProducts());
    return;
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const body = await readJsonBody(req);
      const nextProducts = Array.isArray(body) ? body : body.products;
      if (!Array.isArray(nextProducts)) {
        res.status(400).json({ error: 'Products array is required.' });
        return;
      }

      res.status(200).json(await setProducts(nextProducts));
    } catch (error) {
      res.status(400).json({ error: error?.message || 'Invalid request.' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
