import {
  getProducts,
  handleOptions,
  readJsonBody,
  requireAdmin,
  setCorsHeaders,
  setProducts,
} from './_lib/state.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'GET') {
    res.status(200).json(getProducts());
    return;
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) {
      return;
    }

    readJsonBody(req)
      .then((body) => {
        const nextProducts = Array.isArray(body) ? body : body.products;
        if (!Array.isArray(nextProducts)) {
          res.status(400).json({ error: 'Products array is required.' });
          return;
        }

        res.status(200).json(setProducts(nextProducts));
      })
      .catch(() => {
        res.status(400).json({ error: 'Invalid request.' });
      });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
