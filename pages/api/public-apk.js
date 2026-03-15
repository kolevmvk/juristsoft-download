import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const { app, file } = req.query;
  if (!app || !file) {
    return res.status(400).send('Missing app or file parameter');
  }

  // Security: only allow safe characters
  if (!/^[a-zA-Z0-9_-]+$/.test(app) || !/^[a-zA-Z0-9_.-]+$/.test(file)) {
    return res.status(400).send('Invalid app or file');
  }

  const publicPath = path.join(process.cwd(), 'public', 'apk', 'apps');
  const filePath = path.join(publicPath, app, file);

  if (!filePath.startsWith(publicPath)) {
    return res.status(403).send('Forbidden');
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  fs.createReadStream(filePath).pipe(res);
}
