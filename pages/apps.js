import fs from 'fs';
import path from 'path';

export async function getServerSideProps() {
  const manifestPath = path.join(process.cwd(), 'private', 'apk', 'apps', 'apps.json');
  let apps = [];
  try {
    apps = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).apps || [];
  } catch {}
  return { props: { apps, year: new Date().getFullYear() } };
}

export default function Apps({ apps, year }) {
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
      </header>
      <main className="portal-main">
        <div className="portal-content">
          <div className="install-note">
            <strong>Instalacija na Android:</strong> Ako se pojavi poruka &ldquo;Nepoznati izvor&rdquo;, dozvoli instalaciju za browser ili File Manager.
          </div>
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
                        : <span className="version-abi">—</span>}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <footer className="portal-footer">© {year} Jurist Biro · JuristSoft</footer>
    </div>
  );
}
