import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Apps() {
  const [apps, setApps] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [year, setYear] = useState(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (!t) { window.location.href = '/'; return; }

    (async () => {
      try {
        setBusy(true);
        const r = await fetch('/api/apps', { headers: { Authorization: `Bearer ${t}` } });
        if (!r.ok) { setErr(await r.text()); return; }
        const data = await r.json();
        setApps(data.apps || []);
      } catch {
        setErr('Greška pri čitanju aplikacija');
      } finally { setBusy(false); }
    })();
  }, []);

  async function download(appId, file) {
    const t = localStorage.getItem('jwt');
    const r = await fetch(`/api/download?app=${encodeURIComponent(appId)}&file=${encodeURIComponent(file)}`, {
      headers: { Authorization: `Bearer ${t}` }
    });
    if (!r.ok) { setErr(await r.text()); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = file; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="wrap">
      <div className="shell" style={{maxWidth: 900}}>
        <div className="brand">
          <img src="/JuristSoft-logo-darkgit.png" alt="JuristSoft" />
          <h1>JuristSoft — Test APK repozitorijum</h1>
        </div>

        <div className="badges">
          <span className="badge warn">TEST okruženje</span>
          <span className="badge">Interna upotreba</span>
          <Link className="badge" href="/">← Odjava / Login</Link>
        </div>

        <div className="card">
          <h2>Dostupne aplikacije</h2>
          <p className="muted">Ovde preuzimaš konkretne verzije APK-a. Dodavanje verzija radiš lokalno kroz repo (folder + manifest).</p>

          {busy && <div className="note">Učitavam…</div>}
          {err && <div className="alert">{err}</div>}

          {!busy && apps.length === 0 && <div className="note">Nema definisanih aplikacija.</div>}

          <div style={{display:'grid', gap:16}}>
            {apps.map(app => (
              <div key={app.id} style={{padding:16, border:'1px solid var(--border)', borderRadius:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, flexWrap:'wrap'}}>
                  <div>
                    <div style={{fontSize:18, fontWeight:700}}>{app.name}</div>
                    <div className="muted">{app.description}</div>
                  </div>
                  <div className="badge">ID: {app.id}</div>
                </div>

                <div style={{marginTop:12}}>
                  <div className="muted" style={{marginBottom:6}}>Verzije:</div>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                    {(!app.versions || app.versions.length === 0) && (
                      <span className="muted">Nema dostupnih verzija</span>
                    )}
                    {app.versions?.map(v => (
                      <button
                        key={v.version}
                        className="btn-ok"
                        onClick={() => download(app.id, v.file)}
                        style={{flex:'0 0 auto'}}
                      >
                        Download {v.version}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="footer">© {year ?? ''} Jurist Biro · QA/TEST</div>
      </div>
      <div className="ribbon">JuristSoft · Releases</div>
    </div>
  );
}
