import {
  createToken,
  handleOptions,
  readJsonBody,
  setCorsHeaders,
  verifyAdminCredentials,
} from './_lib/state.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  readJsonBody(req)
    .then((body) => {
      if (!verifyAdminCredentials(body.email, body.password)) {
        res.status(401).json({ error: 'Invalid admin credentials.' });
        return;
      }

      res.status(200).json({
        token: createToken(body.email),
        email: body.email,
      });
    })
    .catch(() => {
      res.status(400).json({ error: 'Invalid request.' });
    });
}
