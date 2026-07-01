import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Apps() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (!t) { router.replace('/'); return; }

    (async () => {
      try {
        setBusy(true);
        const r = await fetch('/api/apps', { headers: { Authorization: `Bearer ${t}` } });
        if (r.status === 401) { localStorage.removeItem('jwt'); router.replace('/'); return; }
        if (!r.ok) { setErr('Greška pri učitavanju aplikacija.'); return; }
        const data = await r.json();
        setApps(data.apps || []);
      } catch {
        setErr('Greška u mreži.');
      } finally {
        setBusy(false);
      }
    })();
  }, [router]);

  function logout() {
    localStorage.removeItem('jwt');
    router.replace('/');
  }

  return (
    <div className="portal">
      <header className="portal-header">
        <div className="portal-brand">
          <img src="/JuristSoft-logo-darkgit.png" alt="JuristSoft" />
          <div>
            <h1>JuristSoft Download Portal</h1>
            <p className="portal-subtitle">Test APK-ovi · Samo za internu upotrebu</p>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>Odjava</button>
      </header>

      <main className="portal-main">
        <div className="portal-content">
          <div className="install-note">
            <strong>Instalacija na Android:</strong> Ako se pojavi poruka &ldquo;Nepoznati izvor&rdquo; ili &ldquo;Install unknown apps&rdquo;, dozvoli instalaciju za browser ili File Manager.
          </div>

          {busy && <p style={{color:'var(--muted)'}}>Učitavam...</p>}
          {err && <p style={{color:'#ff6b6b'}}>{err}</p>}

          <div className="portal-intro"><h2>Dostupne aplikacije</h2></div>

          <div className="app-grid">
            {apps.map((app) => (
              <article key={app.id} className="app-card">
                <div className="app-card-header">
                  <h3>{app.name}</h3>
                  <p className="app-desc">{app.description}</p>
                </div>
                <div className="app-versions">
                  {(app.versions || []).map((v, i) => (
                    <div key={i} className="version-item">
                      <div className="version-info">
                        <span className="version-num">v{v.version}</span>
                        {v.latest && <span className="version-latest">Latest</span>}
                        {v.abi && <span className="version-abi">{v.abi}</span>}
                        {v.date && <span className="version-date">{v.date}</span>}
                      </div>
                      {v.downloadUrl
                        ? <a className="btn-download" href={v.downloadUrl} download>Preuzmi APK</a>
                        : <span className="version-abi">Nedostupno</span>
                      }
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer className="portal-footer">
        © {new Date().getFullYear()} Jurist Biro · JuristSoft
      </footer>
    </div>
  );
}
