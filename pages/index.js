import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (!t) return;
    (async () => {
      try {
        const r = await fetch('/api/apps', { headers: { Authorization: `Bearer ${t}` } });
        if (r.ok) router.replace('/apps');
        else localStorage.removeItem('jwt');
      } catch {}
    })();
  }, [router]);

  async function login() {
    try {
      setBusy(true); setErr('');
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) { setErr(await r.text()); return; }
      const data = await r.json();
      localStorage.setItem('jwt', data.token);
      router.replace('/apps');
    } catch {
      setErr('Greška u mreži');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-shell">
        <div className="login-brand">
          <img src="/JuristSoft-logo-darkgit.png" alt="JuristSoft" />
          <div>
            <h1>JuristSoft Download Portal</h1>
            <p className="portal-subtitle">Interno preuzimanje APK-ova</p>
          </div>
        </div>

        <div className="login-card">
          <h2>Prijava</h2>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="email"
            disabled={busy}
          />
          <label>Lozinka</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="lozinka"
            disabled={busy}
            onKeyDown={e => { if (e.key === 'Enter') login(); }}
          />
          <button className="btn-login" onClick={login} disabled={busy}>
            {busy ? 'Prijava...' : 'Uloguj se'}
          </button>
          {err && <div className="login-err">{err}</div>}
        </div>

        <div className="portal-footer-small">© {new Date().getFullYear()} Jurist Biro · Interno</div>
      </div>
    </div>
  );
}
