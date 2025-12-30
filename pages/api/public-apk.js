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

  // Construct file path - check both public and private folders
  // Priority: private first (to avoid public/ being included in build)
  let filePath = path.join(process.cwd(), 'private', 'apk', 'apps', app, file);
  
  // Fallback to public if not found in private
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'public', 'apk', 'apps', app, file);
  }

  // Security: prevent path traversal
  const privatePath = path.join(process.cwd(), 'private', 'apk');
  const publicPath = path.join(process.cwd(), 'public', 'apk');
  if (!filePath.startsWith(privatePath) && !filePath.startsWith(publicPath)) {
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
