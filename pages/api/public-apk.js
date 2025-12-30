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

  // Construct file path in public folder
  const filePath = path.join(process.cwd(), 'public', 'apk', 'apps', app, file);

  // Security: prevent path traversal
  if (!filePath.startsWith(path.join(process.cwd(), 'public', 'apk'))) {
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

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}
