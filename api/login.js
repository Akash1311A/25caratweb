import {
  createToken,
  handleOptions,
  readJsonBody,
  setCorsHeaders,
  verifyAdminCredentials,
} from './_lib/state.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    if (!(await verifyAdminCredentials(body.email, body.password))) {
      res.status(401).json({ error: 'Invalid admin credentials.' });
      return;
    }

    res.status(200).json({
      token: createToken(body.email),
      email: body.email,
    });
  } catch (error) {
    res.status(400).json({ error: error?.message || 'Invalid request.' });
  }
}
