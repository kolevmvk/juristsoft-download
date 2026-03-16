// pages/api/apps.js
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  // JWT
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  try { jwt.verify(token, process.env.JWT_SECRET || 'dev-secret'); }
  catch { return res.status(401).send('Unauthorized'); }

  // ← OVO JE KLJUČNO: path do manifesta
  const manifestPath = path.join(process.cwd(), 'private', 'apk', 'apps', 'apps.json');

  if (!fs.existsSync(manifestPath)) {
    return res.status(500).send('Manifest not found');
  }

  try {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // očekujemo formu { "apps": [...] }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.json(data);
  } catch (e) {
    console.error('apps.json parse error:', e);
    return res.status(500).send('Manifest parse error');
  }
}
