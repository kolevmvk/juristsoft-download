import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState('test@juristsoft.com');
  const [password, setPassword] = useState('test123');
  const [token, setToken] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Pametan auto-redirect: samo ako token VAŽI (proveravamo /api/apps)
  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (!t) return;
    (async () => {
      try {
        const r = await fetch('/api/apps', { headers: { Authorization: `Bearer ${t}` } });
        if (r.ok) {
          setToken(t);
          router.push('/apps');
        } else {
          localStorage.removeItem('jwt'); // token ne važi -> ostajemo na loginu
        }
      } catch {
        // mrežna greška -> ostaj na loginu
      }
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
      setToken(data.token);
      router.push('/apps'); // nakon uspešnog logina ideš na apps
    } catch {
      setErr('Greška u mreži');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <div className="shell">
        <div className="brand">
          <img src="/JuristSoft-logo-darkgit.png" alt="JuristSoft" />
          <h1>Jurist Biro — APK Portal</h1>
        </div>

        <div className="badges">
          <span className="badge warn">TEST okruženje</span>
          <span className="badge">Samo za internu upotrebu</span>
        </div>

        <div className="card">
          <h2>Prijava</h2>
          <p className="muted">
            Portal za <strong>bezbedno preuzimanje</strong> test verzija JuristSoft aplikacija (APK).
          </p>

          <label>Email</label>
          <input
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
            onKeyDown={(e)=>{ if(e.key==='Enter') login(); }}
          />

          <div className="row">
            <button
              className={`btn-primary ${busy ? 'btn-disabled' : ''}`}
              onClick={login}
              disabled={busy}
            >
              {busy ? '...' : 'Uloguj se'}
            </button>
          </div>

          {err && <div className="alert">{err}</div>}
        </div>

        <div className="footer">© {new Date().getFullYear()} Jurist Biro · Test portal</div>
      </div>

      <div className="ribbon">JuristSoft · QA/TEST</div>
    </div>
  );
}
