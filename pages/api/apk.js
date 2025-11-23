import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { responseLimit: false },
};

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');

  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

  try {
    jwt.verify(token, secret);
  } catch (e) {
    return res.status(401).send('Unauthorized');
  }

  const filePath = path.join(process.cwd(), 'private', 'apk', 'juristsoft-worker-v0.1.0.apk');

  if (!fs.existsSync(filePath)) return res.status(404).send('APK not found');

  const stat = fs.statSync(filePath);

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', 'attachment; filename="juristsoft-worker-v0.1.0.apk"');

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}
