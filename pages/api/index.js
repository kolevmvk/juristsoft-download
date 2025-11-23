import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [err, setErr] = useState('');

  async function login() {
    setErr('');
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!r.ok) {
      setErr(await r.text());
      return;
    }

    const data = await r.json();
    setToken(data.token);
    localStorage.setItem('jwt', data.token);
  }

  async function downloadApk() {
    const t = token || localStorage.getItem('jwt');
    if (!t) {
      setErr('Nisi prijavljen.');
      return;
    }

    const r = await fetch('/api/apk', {
      headers: { 'Authorization': `Bearer ${t}` }
    });

    if (!r.ok) {
      setErr(await r.text());
      return;
    }

    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'juristsoft-worker-v0.1.0.apk';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>JuristSoft — APK Download</h2>

      <label>Email</label><br />
      <input value={email} onChange={e => setEmail(e.target.value)} /><br /><br />

      <label>Password</label><br />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} /><br /><br />

      <button onClick={login}>Login</button><br /><br />

      <button onClick={downloadApk}>Download APK</button><br /><br />

      {err && <div style={{ color: 'red' }}>{err}</div>}
    </div>
  );
}
