import { StrictMode, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { configured, saveResponse } from './api';
import { programs, questions, scale, scoreResponses } from './scoring';
import './styles.css';

const Instructor = lazy(() => import('./Instructor'));
const QRPage = lazy(() => import('./QRPage'));

function Assessment() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [program, setProgram] = useState('');
  const [result, setResult] = useState<ReturnType<typeof scoreResponses> | null>(null);
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'failed' | 'unconfigured'>('saving');
  const submitted = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0); }, [step, result]);
  function submit() {
    if (submitted.current) return;
    const profile = scoreResponses(answers);
    submitted.current = true;
    setResult(profile);
    if (!configured) { setSaveState('unconfigured'); return; }
    // Calculate and render the profile first; the network never gates results.
    setSaveState('saving');
    void saveResponse(crypto.randomUUID(), answers, program).then(() => setSaveState('saved')).catch(() => setSaveState('failed'));
  }
  if (result) return <section className="card result">
    <div className="eyebrow">Your AI Study Profile</div>
    <div className="result-symbol" aria-hidden="true">✧</div>
    <h1 ref={heading} tabIndex={-1}>{result.category}</h1>
    <p className="lead">{result.description}</p>
    <p className="muted">A snapshot of your study habits today. This is a reflection, not a grade.</p>
    <blockquote>If you cannot explain it without the AI, you do not know it yet.</blockquote>
    <div className="next-step"><h2>One thing to try next</h2><p>{result.nextStep}</p></div>
    <p className="partner">Use AI as a study partner, not a ghostwriter.</p>
    <p className="save-note" role="status">{saveState === 'saving' ? 'Saving your anonymous responses…' : saveState === 'saved' ? 'Your anonymous responses have been saved. You’re all set.' : saveState === 'failed' ? 'Your profile is ready. We could not confirm your responses were saved; your result is still valid.' : 'Your profile is ready. Anonymous response storage has not been connected yet.'}</p>
    <p className="muted small">No name, email, or student ID is collected.</p>
  </section>;
  if (step === -1) return <section className="card intro">
    <div className="eyebrow">College Success and Beyond</div>
    <div className="intro-symbol" aria-hidden="true">✧</div>
    <h1 ref={heading} tabIndex={-1}>Your thinking.<br />Your AI study profile.</h1>
    <p className="lead">How do you use AI to learn? Take a quick look at your study habits—and find one way to make them stronger.</p>
    <div className="facts"><span>5 questions</span><span>About 1 minute</span><span>Anonymous</span></div>
    <label className="program-label" htmlFor="program">What is your current or intended program area? <span className="muted small">Optional</span></label>
    <select id="program" value={program} onChange={e => setProgram(e.target.value)}><option value="">Prefer not to answer</option>{programs.map(p => <option key={p}>{p}</option>)}</select>
    <button className="primary" onClick={() => setStep(0)}>Discover my profile <span aria-hidden="true">→</span></button>
    <p className="muted small">No sign-in. No name, email, or student ID. Your answers are for reflection, not a grade.</p>
  </section>;
  return <section className="card assessment">
    <div className="progress-meta"><span>Question {step + 1} of 5</span><span>Your study habits</span></div>
    <div className="progress-track" role="progressbar" aria-label="Assessment progress" aria-valuemin={0} aria-valuemax={5} aria-valuenow={step + 1}><div style={{ width: `${(step + 1) * 20}%` }} /></div>
    <h1 className="question" ref={heading} tabIndex={-1}>{questions[step]}</h1>
    <p className="muted">Choose what best describes you right now.</p>
    <fieldset className="choices"><legend className="sr-only">Your response to question {step + 1}</legend>{scale.map((label, i) => <label key={i} className={`choice ${answers[step] === i + 1 ? 'selected' : ''}`}><input type="radio" name={`question-${step}`} value={i + 1} checked={answers[step] === i + 1} onChange={() => setAnswers(previous => previous.map((v, n) => n === step ? i + 1 : v))} /><span className="scale-number">{i + 1}</span><span>{label}</span><span className="choice-check" aria-hidden="true">{answers[step] === i + 1 ? '✓' : '○'}</span></label>)}</fieldset>
    <div className="actions"><button className="secondary" onClick={() => setStep(s => s - 1)}>Back</button><button className="primary" disabled={!answers[step]} onClick={() => step === 4 ? submit() : setStep(s => s + 1)}>{step === 4 ? 'See my profile' : 'Next question'} <span aria-hidden="true">→</span></button></div>
  </section>;
}
function App() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => { const update = () => setRoute(window.location.hash); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  const page = route === '#/instructor' ? <Instructor /> : route === '#/qr' ? <QRPage /> : <Assessment />;
  return <><header className="brand"><a href="#/" aria-label="AI Study Profile home"><span className="brand-mark" aria-hidden="true">✧</span> AI Study Profile</a><span className="brand-caption">Learn with intention.</span></header><main><Suspense fallback={<section className="card"><p role="status">Loading…</p></section>}>{page}</Suspense></main><footer>College Success and Beyond <span aria-hidden="true">·</span> <a href="#/instructor">Instructor</a> <span aria-hidden="true">·</span> <a href="#/qr">QR code</a></footer></>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
