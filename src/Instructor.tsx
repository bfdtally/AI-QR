import { useState } from 'react';
import type { FormEvent } from 'react';
import { configured, getSummary, instructorSignIn, instructorSignOut } from './api';
import type { Summary } from './api';
import { categories, questionLabels, scale } from './scoring';

const number = (n: number | null) => n === null ? '—' : n.toFixed(1);
const percentage = (count: number, total: number) => total ? `${(count / total * 100).toFixed(1)}%` : '0%';
export default function Instructor() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Instructor tokens are held only in memory, never attached to student answers.
  const [token, setToken] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    let accessToken = '';
    try {
      accessToken = await instructorSignIn(email.trim(), password);
      setPassword('');
      const data = await getSummary(accessToken);
      setToken(accessToken); setSummary(data);
    } catch {
      if (accessToken) void instructorSignOut(accessToken).catch(() => {});
      setError('Unable to open results. Check your instructor email and password, and make sure your account has instructor access.');
    } finally { setBusy(false); }
  }
  async function refresh() {
    setBusy(true); setError('');
    try { setSummary(await getSummary(token)); }
    catch { setSummary(null); setToken(''); setError('Your session expired or results could not be loaded. Please sign in again.'); }
    finally { setBusy(false); }
  }
  function logout() { void instructorSignOut(token).catch(() => {}); setToken(''); setSummary(null); }
  if (!summary) return <section className="card">
    <div className="eyebrow">Instructor access</div><h1>Class reflection, together.</h1>
    <p className="lead">View anonymous class patterns. Student records are never displayed.</p>
    {!configured ? <p role="status">Supabase has not been connected yet.</p> : <form onSubmit={login} className="login-form">
      <label htmlFor="email">Instructor email</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
      <label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
      <button className="primary" disabled={busy}>{busy ? 'Opening results…' : 'Open class results'}</button>
    </form>}
    {error && <p className="error" role="alert">{error}</p>}
    <p className="muted small">Students do not sign in. This access is for the instructor only.</p><a className="text-link" href="#/">Return to assessment</a>
  </section>;
  return <section className="card dashboard">
    <div className="eyebrow">Instructor results</div><h1>Our AI study habits</h1><p className="muted">Anonymous responses, summarized. Profiles describe habits, not grades.</p>
    <div className="actions"><button className="secondary" onClick={refresh} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh results'}</button><button className="secondary" onClick={logout}>Sign out</button></div>
    <div className="stats"><div><span className="stat-number">{summary.total_responses}</span><span>Total responses</span></div><div><span className="stat-number">{number(summary.average_score)}<small> / 20</small></span><span>Average score</span></div></div>
    {!summary.total_responses && <p className="empty">No responses yet. Share the <a href="#/qr">assessment QR code</a> to get started.</p>}
    <h2>Profile distribution</h2><div className="profile-distribution">{categories.map(category => { const count = summary.profiles.find(p => p.category === category)?.count ?? 0; return <div className="distribution-row" key={category}><div><strong>{category}</strong><span>{count} · {percentage(count, summary.total_responses)}</span></div><div className="bar"><div style={{ width: `${summary.total_responses ? count / summary.total_responses * 100 : 0}%` }} /></div></div>; })}</div>
    <h2>Average response to each question</h2><p className="muted small">{scale.map((s, i) => `${i + 1} = ${s}`).join(' · ')}</p><div>{questionLabels.map((label, i) => <div className="question-average" key={label}><span>Q{i + 1}. {label}</span><strong>{number(summary.question_averages[i] ?? null)} <span className="muted">/ 4</span></strong></div>)}</div>
    <h2>Breakdown by program area</h2>{summary.programs.map(p => <article className="program-summary" key={p.program_area}><h3>{p.program_area}</h3><p>{p.count} responses ({percentage(p.count, summary.total_responses)}) · Average score: {number(p.average_score)} / 20</p><ul>{categories.map(c => {const n = p.profiles.find(v => v.category === c)?.count ?? 0; return <li key={c}><span>{c}</span><strong>{n} · {percentage(n, p.count)}</strong></li>;})}</ul></article>)}
    <p className="muted small">Counts represent submissions, not unique students. No identifying student information is stored.</p>
  </section>;
}
