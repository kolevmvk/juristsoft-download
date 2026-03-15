import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export const config = { api: { responseLimit: false } };

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  const secret = process.env.JWT_SECRET || 'dev-secret';
  try { jwt.verify(token, secret); } catch { return res.status(401).send('Unauthorized'); }

  const { app, file } = req.query;
  if (!app || !file) return res.status(400).send('Missing app or file');

  // Security: only allow alphanumeric, dash, dot in app and file
  if (!/^[a-zA-Z0-9_-]+$/.test(app) || !/^[a-zA-Z0-9_.-]+$/.test(file)) {
    return res.status(400).send('Invalid app or file');
  }

  // Single source: public/apk/apps/{app}/{file} (deployed on Vercel)
  const filePath = path.join(process.cwd(), 'public', 'apk', 'apps', app, file);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  fs.createReadStream(filePath).pipe(res);
}
