// pages/api/login.js
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).send('Missing email or password');

  const secret = process.env.JWT_SECRET || 'dev-secret';

  // 1) file-based users: private/users.json
  const usersPath = path.join(process.cwd(), 'private', 'users.json');
  if (fs.existsSync(usersPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      const users = Array.isArray(data?.users) ? data.users : [];
      const u = users.find(x => String(x.email || '').toLowerCase() === String(email).toLowerCase());
      if (!u) return res.status(401).send('Neispravan email ili lozinka (U1)');

      const ok = await bcrypt.compare(password, u.passwordHash || '');
      if (!ok) return res.status(401).send('Neispravan email ili lozinka (U2)');

      const token = jwt.sign({ sub: email, role: 'user' }, secret, { expiresIn: '24h' });
      return res.json({ token });
    } catch (e) {
      console.error('users.json parse error:', e);
      return res.status(500).send('Auth config error (parse)');
    }
  }

  // 2) fallback: ADMIN_* iz env-a
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass  = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPass) return res.status(500).send('Auth config error (ENV)');

  if (email !== adminEmail || password !== adminPass) {
    return res.status(401).send('Neispravan email ili lozinka (A1)');
  }

  const token = jwt.sign({ sub: email, role: 'admin' }, secret, { expiresIn: '24h' });
  return res.json({ token });
}
