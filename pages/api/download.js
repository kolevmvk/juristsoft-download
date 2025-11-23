import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export const config = { api: { responseLimit: false } };

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  try { jwt.verify(token, secret); } catch { return res.status(401).send('Unauthorized'); }

  const { app, version } = req.query;
  if (!app || !version) return res.status(400).send('Missing app or version');

  const filePath = path.join(process.cwd(), 'private', 'apk', 'apps', app, `${version}.apk`);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${app}-${version}.apk"`);

  fs.createReadStream(filePath).pipe(res);
}
