// scripts/add-user.mjs  — dodaj/izmeni korisnika u private/users.json (bcryptjs hash)
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error('Usage: node scripts/add-user.mjs "email@firma.com" "lozinka"');
  process.exit(1);
}

const usersFile = path.join(process.cwd(), 'private', 'users.json');

let data = { users: [] };
if (fs.existsSync(usersFile)) {
  try {
    data = JSON.parse(fs.readFileSync(usersFile, 'utf8')) || { users: [] };
  } catch {
    console.error('Greška: private/users.json nije validan JSON.');
    process.exit(1);
  }
}

const hash = await bcrypt.hash(password, 10);

const i = (data.users || []).findIndex(
  u => (u.email || '').toLowerCase() === email.toLowerCase()
);

if (i >= 0) {
  data.users[i].passwordHash = hash;
  console.log(`Ažurirana lozinka za ${email}`);
} else {
  data.users.push({ email, passwordHash: hash });
  console.log(`Dodat korisnik ${email}`);
}

fs.mkdirSync(path.dirname(usersFile), { recursive: true });
fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), 'utf8');
console.log('Upisano u private/users.json');
