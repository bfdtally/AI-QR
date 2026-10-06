import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRPage() {
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  let studentURL = '';
  try {
    const candidate = new URL(import.meta.env.VITE_PUBLIC_STUDENT_URL || `${window.location.origin}${window.location.pathname}`);
    if (candidate.protocol !== 'https:' && !(candidate.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(candidate.hostname))) throw new Error();
    candidate.hash = ''; candidate.search = '';
    studentURL = candidate.href;
  } catch { /* Configuration errors are shown below, never encoded. */ }
  const isLocal = studentURL.includes('://localhost') || studentURL.includes('://127.0.0.1');
  useEffect(() => {
    let active = true;
    if (!studentURL) { setError('Set a valid public HTTPS student URL before sharing.'); return; }
    QRCode.toDataURL(studentURL, { width: 1200, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } }).then(data => { if (active) setImage(data); }).catch(() => { if (active) setError('The QR code could not be generated. Please reload.'); });
    return () => { active = false; };
  }, [studentURL]);
  return <section className="card qr-page"><div className="eyebrow">College Success and Beyond</div><h1>How do you study with AI?</h1><p className="lead">Scan to discover your AI Study Profile.</p><p>5 questions. About 1 minute. Completely anonymous.</p>
    {error && <p role="alert" className="error">{error}</p>}
    {image && <img className="qr-image" src={image} alt="QR code linking to the AI Study Profile assessment" width={1200} height={1200} />}
    {studentURL && <a className="qr-url" href={studentURL}>{studentURL}</a>}
    {isLocal && <p className="error">Preview only: this local address cannot be used by students. Open this page on the public Render site to generate the classroom QR code.</p>}
    <p className="partner">Use AI as a study partner, not a ghostwriter.</p>
    <div className="actions no-print">{image && !isLocal && <a className="primary button-link" href={image} download="AI-Study-Profile-QR.png">Download QR PNG</a>}<button className="secondary" onClick={() => window.print()}>Print page</button></div>
  </section>;
}
