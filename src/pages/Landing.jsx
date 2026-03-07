import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../lib/auth';
import ThemeToggle from '../components/ThemeToggle';

// ─── Mock clause data ─────────────────────────────────────────────────────────

const MOCK_CLAUSES = [
  {
    text: 'Employee agrees to a 36-month non-compete clause covering all of West Africa.',
    rating: 'RED', label: 'DANGER',
    explanation: 'Non-compete over 24 months is extreme and likely unenforceable in Ghana.',
    color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
    lightBg: '#fef2f2', lightBorder: '#fecaca', lightText: '#dc2626',
  },
  {
    text: 'Employee is entitled to 15 working days of annual leave per calendar year.',
    rating: 'BLUE', label: 'YOUR RIGHTS',
    explanation: 'This matches the Ghana Labour Act minimum — this clause protects you.',
    color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)',
    lightBg: '#eff6ff', lightBorder: '#bfdbfe', lightText: '#2563eb',
  },
  {
    text: 'Monthly salary of GHS 4,500 payable on the last working day of each month.',
    rating: 'GREEN', label: 'STANDARD',
    explanation: 'Clear salary terms with standard payment schedule. Nothing unusual here.',
    color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)',
    lightBg: '#f0fdf4', lightBorder: '#bbf7d0', lightText: '#16a34a',
  },
  {
    text: 'Employer may terminate employment at any time without notice or reason.',
    rating: 'RED', label: 'DANGER',
    explanation: 'Ghana Labour Act requires 1–2 months notice minimum. This clause waives your rights.',
    color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
    lightBg: '#fef2f2', lightBorder: '#fecaca', lightText: '#dc2626',
  },
  {
    text: 'Rental advance of 12 months required before tenant takes possession.',
    rating: 'RED', label: 'DANGER',
    explanation: 'Ghana Rent Act (CAP 109) limits advance to 6 months. This is illegal.',
    color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
    lightBg: '#fef2f2', lightBorder: '#fecaca', lightText: '#dc2626',
  },
];

// ─── Analysis Preview (inside browser mockup) ────────────────────────────────

function AnalysisPreview() {
  const [visibleClauses, setVisibleClauses] = useState([]);
  const [scanning, setScanning] = useState(true);
  const [scanPct, setScanPct]   = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!scanning) return;
    setScanPct(0);
    let pct = 0;
    const t = setInterval(() => {
      pct += 2;
      setScanPct(Math.min(pct, 100));
      if (pct >= 100) { clearInterval(t); setScanning(false); }
    }, 25);
    return () => clearInterval(t);
  }, [scanning]);

  useEffect(() => {
    if (scanning) return;
    const t = setInterval(() => {
      if (indexRef.current < MOCK_CLAUSES.length) {
        const idx = indexRef.current;
        setVisibleClauses((prev) => [...prev, MOCK_CLAUSES[idx]]);
        indexRef.current += 1;
      } else {
        setTimeout(() => {
          setVisibleClauses([]);
          indexRef.current = 0;
          setScanning(true);
          setScanPct(0);
        }, 2500);
        clearInterval(t);
      }
    }, 850);
    return () => clearInterval(t);
  }, [scanning]);

  const redCount = visibleClauses.filter(c => c.rating === 'RED').length;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F8FAF7', height: '100%', overflowY: 'hidden' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 20px', display: 'flex', alignItems: 'center', height: 48, gap: 20 }}>
        <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 28, objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {['Dashboard', 'Analyse', 'Lawyers'].map((label, i) => (
            <div key={label} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: i === 0 ? '#1B4332' : '#9ca3af', background: i === 0 ? '#f0f7f3' : 'transparent' }}>
              {label}
            </div>
          ))}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B4332', overflow: 'hidden', flexShrink: 0 }}>
            <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
              <ellipse cx="16" cy="29" rx="11" ry="7" fill="#52B788" opacity="0.85" />
              <circle cx="16" cy="13" r="6.5" fill="#52B788" />
              <circle cx="14" cy="11.5" r="1.8" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>
      </div>

      <div style={{ padding: '16px 20px 24px' }}>
        <p style={{ fontSize: 12, color: '#1B4332', marginBottom: 12, fontWeight: 500 }}>← Dashboard</p>

        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '16px 18px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Employment Contract</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '4px 12px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>HIGH RISK</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Employment_Contract.pdf</div>
          </div>

          {scanning ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>Analysing with Klaro AI...</span>
                <span style={{ fontSize: 11, color: '#D4A017', fontWeight: 600 }}>{scanPct}%</span>
              </div>
              <div style={{ height: 5, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${scanPct}%`, background: 'linear-gradient(90deg, #1B4332, #52B788)', borderRadius: 4, transition: 'width 0.025s linear' }} />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
              "This employment agreement contains clauses that may conflict with Ghana's Labour Act (Act 651). Review all RED items before signing."
            </p>
          )}

          {!scanning && redCount > 0 && (
            <div style={{ marginTop: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '7px 12px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', margin: 0 }}>
                ⚠ {redCount} dangerous clause{redCount !== 1 ? 's' : ''} found — scroll to review
              </p>
            </div>
          )}
        </div>

        {!scanning && visibleClauses.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {['ALL', 'RED', 'BLUE', 'GREEN'].map((f, i) => (
              <div key={f} style={{
                padding: '4px 11px', borderRadius: 20, cursor: 'default',
                background: i === 0 ? '#1B4332' : '#f3f4f6',
                color: i === 0 ? '#fff' : '#6b7280',
                fontSize: 11, fontWeight: 600,
                border: i === 0 ? 'none' : '1px solid #e5e7eb',
              }}>
                {f}{f === 'ALL' && ` (${visibleClauses.length})`}
                {f === 'RED' && ` (${visibleClauses.filter(c => c.rating === 'RED').length})`}
                {f === 'BLUE' && ` (${visibleClauses.filter(c => c.rating === 'BLUE').length})`}
                {f === 'GREEN' && ` (${visibleClauses.filter(c => c.rating === 'GREEN').length})`}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleClauses.map((clause, i) => (
            <div key={i} style={{ background: clause.lightBg, border: `1px solid ${clause.lightBorder}`, borderRadius: 12, padding: '11px 14px', animation: 'previewSlideIn 0.35s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: clause.lightText, background: clause.lightBg, border: `1px solid ${clause.lightBorder}`, borderRadius: 20, padding: '2px 8px', letterSpacing: '0.05em' }}>
                  {clause.label}
                </span>
              </div>
              <p style={{ color: '#374151', fontSize: 12, margin: '0 0 5px', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{clause.text.length > 68 ? clause.text.slice(0, 68) + '…' : clause.text}"
              </p>
              <p style={{ color: '#6b7280', fontSize: 11.5, margin: 0, lineHeight: 1.5 }}>{clause.explanation}</p>
            </div>
          ))}
          {!scanning && visibleClauses.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #1B4332', borderTopColor: 'transparent', borderRadius: '50%', animation: 'previewSpin 0.8s linear infinite' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mouse Cursor ─────────────────────────────────────────────────────────────

const CURSOR_WAYPOINTS = [
  { x: 190, y: 58,  pause: 1400, click: true  },  // Analyse tab in inner nav
  { x: 38,  y: 106, pause: 900,  click: false },  // ← back link
  { x: 230, y: 170, pause: 1100, click: false },  // summary card
  { x: 230, y: 275, pause: 1000, click: true  },  // first clause card
  { x: 230, y: 345, pause: 900,  click: false },  // second clause card
  { x: 230, y: 415, pause: 900,  click: true  },  // third clause card
  { x: 148, y: 58,  pause: 1100, click: false },  // Dashboard tab
];

function MouseCursor() {
  const [pos,      setPos]      = useState({ x: 190, y: 58 });
  const [clicking, setClicking] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    let t;
    function next() {
      const wp = CURSOR_WAYPOINTS[idxRef.current % CURSOR_WAYPOINTS.length];
      setPos({ x: wp.x, y: wp.y });
      if (wp.click) {
        setTimeout(() => setClicking(true),  650);
        setTimeout(() => setClicking(false), 970);
      }
      idxRef.current++;
      t = setTimeout(next, wp.pause + 750);
    }
    t = setTimeout(next, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      zIndex: 20,
      pointerEvents: 'none',
      transition: 'left 0.72s cubic-bezier(0.4,0,0.2,1), top 0.72s cubic-bezier(0.4,0,0.2,1)',
      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))',
    }}>
      <svg
        width="18" height="22" viewBox="0 0 18 22"
        style={{ transform: clicking ? 'scale(0.82)' : 'scale(1)', transition: 'transform 0.1s ease', display: 'block' }}
      >
        <path d="M2 1l14.5 9-5.5 1.8-3.5 8.2L2 1z" fill="white" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      {clicking && (
        <div style={{
          position: 'absolute', top: -5, left: -5,
          width: 28, height: 28,
          border: '2px solid rgba(82,183,136,0.75)',
          borderRadius: '50%',
          animation: 'clickRipple 0.45s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

// ─── Browser Mockup ───────────────────────────────────────────────────────────

function BrowserMockup() {
  return (
    <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '75%', height: '50%', background: 'radial-gradient(ellipse, rgba(27,67,50,0.35) 0%, rgba(82,183,136,0.08) 60%, transparent 80%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--lnd-t10)', boxShadow: '0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px var(--lnd-t06)' }}>

        {/* Title bar — always dark chrome */}
        <div style={{ background: '#1d1d1f', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            {['#ff5f57', '#ffbd2e', '#28c840'].map((color, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}60` }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.25)', fontSize: 15, fontWeight: 300, userSelect: 'none', flexShrink: 0 }}>
            <span>‹</span><span>›</span>
          </div>
          <div style={{ flex: 1, background: '#2d2d2f', borderRadius: 7, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ flexShrink: 0 }}>
              <rect x="1" y="5" width="9" height="8" rx="1.5" stroke="#52B788" strokeWidth="1.3" />
              <path d="M3.5 5V3.5a2 2 0 014 0V5" stroke="#52B788" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              klarogh.netlify.app/analysis/employment-contract
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, flexShrink: 0 }}>⇧</div>
        </div>

        {/* Tab bar — always dark */}
        <div style={{ background: '#262626', padding: '6px 16px 0', display: 'flex', alignItems: 'flex-end', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '6px 14px', fontSize: 12, background: '#F8FAF7', borderRadius: '7px 7px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src="/assets/logos/logo.png" style={{ height: 13 }} alt="" />
            <span style={{ color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>Employment Contract · Klaro</span>
            <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 13 }}>×</span>
          </div>
          <div style={{ padding: '6px 12px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>+</div>
        </div>

        {/* App content — always light themed */}
        <div style={{ height: 560, overflow: 'hidden', position: 'relative' }}>
          <AnalysisPreview />
          <MouseCursor />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, #F8FAF7)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Rotating Word ────────────────────────────────────────────────────────────

const HERO_WORDS = [
  'employment contract', 'land agreement', 'loan form', 'music deal',
  'tenancy agreement', 'business contract', 'insurance policy', 'court document',
];

function RotatingWord() {
  const [idx,      setIdx]      = useState(0);
  const [exiting,  setExiting]  = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % HERO_WORDS.length);
        setExiting(false);
        setEntering(true);
        setTimeout(() => setEntering(false), 420);
      }, 280);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const animation =
    exiting  ? 'wordExit 0.28s cubic-bezier(0.4,0,1,1) forwards' :
    entering ? 'wordEnter 0.42s cubic-bezier(0,0,0.2,1) forwards' : 'none';

  return <span style={{ display: 'inline-block', animation }}>{HERO_WORDS[idx]}</span>;
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

const LAWS = [
  'Labour Act (Act 651)', 'Lands Act (Act 1036)', 'Copyright Act (Act 690)',
  'Borrowers & Lenders Act', 'Rent Act (CAP 109)', 'Companies Act (Act 992)',
  'Consumer Protection Act', 'Electronic Transactions Act',
  'Intestate Succession Law', 'Insurance Act (Act 1061)',
];

function Marquee() {
  const items = [...LAWS, ...LAWS];
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 40, animation: 'marquee 28s linear infinite', width: 'max-content' }}>
        {items.map((law, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#52B788', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'var(--lnd-t45)', fontSize: 13, fontWeight: 500 }}>{law}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg, var(--lnd-bg), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(-90deg, var(--lnd-bg), transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({ num, title, desc, icon }) {
  return (
    <div className="step-card" style={{ background: 'var(--lnd-t03)', border: '1px solid var(--lnd-t08)', borderRadius: 20, padding: '28px 24px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(27,67,50,0.3)', border: '1px solid rgba(82,183,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#52B788', letterSpacing: '0.1em' }}>0{num}</span>
      </div>
      <h3 style={{ color: 'var(--lnd-text)', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--lnd-t50)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ─── Colour ratings ───────────────────────────────────────────────────────────

const RATINGS = [
  { label: 'GREEN',  sub: 'Standard',    desc: 'Normal and fair clause.',                  color: '#22c55e', bg: 'rgba(34,197,94,0.07)',    border: 'rgba(34,197,94,0.2)' },
  { label: 'YELLOW', sub: 'Attention',   desc: 'Unusual — read carefully before signing.', color: '#eab308', bg: 'rgba(234,179,8,0.07)',     border: 'rgba(234,179,8,0.2)' },
  { label: 'RED',    sub: 'Danger',      desc: 'Potentially harmful. Get advice first.',   color: '#ef4444', bg: 'rgba(239,68,68,0.07)',     border: 'rgba(239,68,68,0.2)' },
  { label: 'BLUE',   sub: 'Your Rights', desc: 'This clause works in your favour.',        color: '#3b82f6', bg: 'rgba(59,130,246,0.07)',    border: 'rgba(59,130,246,0.2)' },
  { label: 'GREY',   sub: 'Boilerplate', desc: 'Standard legal text. Safe to ignore.',     color: '#9ca3af', bg: 'rgba(156,163,175,0.07)',   border: 'rgba(156,163,175,0.2)' },
];

// ─── Main Landing ─────────────────────────────────────────────────────────────

export default function Landing() {
  const loggedIn = isLoggedIn();

  return (
    <div style={{ background: 'var(--lnd-bg)', minHeight: '100vh', color: 'var(--lnd-text)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <style>{`
        /* ── Theme tokens: dark is :root default, light via html:not(.dark) ── */
        :root {
          --lnd-bg:     #070f0a;
          --lnd-text:   #ffffff;
          --lnd-t90:    rgba(255,255,255,0.90);
          --lnd-t80:    rgba(255,255,255,0.80);
          --lnd-t75:    rgba(255,255,255,0.75);
          --lnd-t60:    rgba(255,255,255,0.60);
          --lnd-t55:    rgba(255,255,255,0.55);
          --lnd-t50:    rgba(255,255,255,0.50);
          --lnd-t45:    rgba(255,255,255,0.45);
          --lnd-t40:    rgba(255,255,255,0.40);
          --lnd-t35:    rgba(255,255,255,0.35);
          --lnd-t28:    rgba(255,255,255,0.28);
          --lnd-t25:    rgba(255,255,255,0.25);
          --lnd-t20:    rgba(255,255,255,0.20);
          --lnd-t15:    rgba(255,255,255,0.15);
          --lnd-t12:    rgba(255,255,255,0.12);
          --lnd-t10:    rgba(255,255,255,0.10);
          --lnd-t08:    rgba(255,255,255,0.08);
          --lnd-t06:    rgba(255,255,255,0.06);
          --lnd-t05:    rgba(255,255,255,0.05);
          --lnd-t04:    rgba(255,255,255,0.04);
          --lnd-t03:    rgba(255,255,255,0.03);
          --lnd-t02:    rgba(255,255,255,0.02);
          --lnd-nav-bg: rgba(7,15,10,0.80);
        }
        html:not(.dark) {
          --lnd-bg:     #F8FAF7;
          --lnd-text:   #1A1A1A;
          --lnd-t90:    rgba(26,26,26,0.95);
          --lnd-t80:    rgba(26,26,26,0.88);
          --lnd-t75:    rgba(26,26,26,0.82);
          --lnd-t60:    rgba(26,26,26,0.68);
          --lnd-t55:    rgba(26,26,26,0.62);
          --lnd-t50:    rgba(26,26,26,0.55);
          --lnd-t45:    rgba(26,26,26,0.50);
          --lnd-t40:    rgba(26,26,26,0.44);
          --lnd-t35:    rgba(26,26,26,0.38);
          --lnd-t28:    rgba(26,26,26,0.32);
          --lnd-t25:    rgba(26,26,26,0.28);
          --lnd-t20:    rgba(26,26,26,0.22);
          --lnd-t15:    rgba(26,26,26,0.17);
          --lnd-t12:    rgba(26,26,26,0.13);
          --lnd-t10:    rgba(26,26,26,0.11);
          --lnd-t08:    rgba(26,26,26,0.09);
          --lnd-t06:    rgba(26,26,26,0.07);
          --lnd-t05:    rgba(26,26,26,0.05);
          --lnd-t04:    rgba(26,26,26,0.04);
          --lnd-t03:    rgba(26,26,26,0.03);
          --lnd-t02:    rgba(26,26,26,0.02);
          --lnd-nav-bg: rgba(248,250,247,0.88);
        }

        /* ── Animations ── */
        @keyframes previewSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes previewSpin    { to { transform:rotate(360deg); } }
        @keyframes marquee        { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes floatUp        { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulseGlow      { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes fadeInUp       { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes wordExit       { from { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } to { opacity:0; transform:translateY(-14px) scale(0.96); filter:blur(3px); } }
        @keyframes wordEnter      { from { opacity:0; transform:translateY(14px) scale(0.96); filter:blur(3px); } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
        @keyframes clickRipple    { from { transform:scale(0.4); opacity:1; } to { transform:scale(2); opacity:0; } }

        /* ── Nav links ── */
        .lnd-nav-link {
          color: var(--lnd-t55); text-decoration: none;
          font-size: 14px; font-weight: 500;
          padding: 6px 14px; border-radius: 10px; transition: all 0.2s;
        }
        .lnd-nav-link:hover { color: var(--lnd-text); background: var(--lnd-t06); }

        /* ── Buttons ── */
        .lnd-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #1B4332; color: #fff; font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 14px; border: none;
          cursor: pointer; text-decoration: none; transition: all 0.2s;
          box-shadow: 0 0 0 1px rgba(82,183,136,0.3), 0 4px 20px rgba(27,67,50,0.4);
        }
        .lnd-btn-primary:hover {
          background: #143626;
          box-shadow: 0 0 0 1px rgba(82,183,136,0.5), 0 8px 30px rgba(27,67,50,0.6);
          transform: translateY(-1px);
        }
        .lnd-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--lnd-t05); color: var(--lnd-t80); font-weight: 600; font-size: 15px;
          padding: 14px 28px; border-radius: 14px; border: 1px solid var(--lnd-t10);
          cursor: pointer; text-decoration: none; transition: all 0.2s;
        }
        .lnd-btn-ghost:hover { background: var(--lnd-t08); border-color: var(--lnd-t15); }
        .lnd-btn-sm {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 8px 18px; border-radius: 11px; font-size: 13px; font-weight: 600;
          text-decoration: none; cursor: pointer; border: none; transition: all 0.2s;
        }

        /* ── Cards ── */
        .stat-card {
          background: var(--lnd-t03); border: 1px solid var(--lnd-t06);
          border-radius: 16px; padding: 24px 20px;
          text-align: center; flex: 1; min-width: 0; transition: all 0.2s;
        }
        .stat-card:hover { background: var(--lnd-t05); border-color: rgba(82,183,136,0.2); }
        @media (max-width: 480px) {
          .stat-card { padding: 16px 10px; border-radius: 12px; }
          .stat-value { font-size: 26px !important; }
          .stat-label { font-size: 11px !important; }
        }
        .rating-card {
          background: var(--lnd-t02); border: 1px solid var(--lnd-t06);
          border-radius: 16px; padding: 20px; transition: all 0.25s; cursor: default;
        }
        .rating-card:hover { background: var(--lnd-t05); border-color: var(--lnd-t12); transform: translateY(-3px); }
        .step-card { transition: all 0.25s; }
        .step-card:hover { transform: translateY(-3px); background: var(--lnd-t05) !important; }
        .pricing-card { transition: all 0.25s; }
        .pricing-card:hover { transform: translateY(-4px); }

        /* ── Footer links ── */
        .lnd-footer-link { color: var(--lnd-t45); font-size: 14px; text-decoration: none; transition: color 0.2s; display: block; }
        .lnd-footer-link:hover { color: var(--lnd-text); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .steps-grid   { flex-direction: column !important; }
          .stats-row    { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .ratings-grid { grid-template-columns: 1fr 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr 1fr !important; }
          .lnd-hide-mobile { display: none !important; }
          .hero-ctas    { flex-direction: column !important; align-items: stretch !important; }
          .hero-trust   { justify-content: center !important; }
          .lnd-btn-primary, .lnd-btn-ghost { width: 100%; justify-content: center; }
        }
        @media (max-width: 480px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .ratings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--lnd-nav-bg)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--lnd-t06)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

          <Link to="/" style={{ flexShrink: 0 }}>
            <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 50, objectFit: 'contain' }} />
          </Link>

          <div className="lnd-hide-mobile" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <a href="#how-it-works" className="lnd-nav-link">How it works</a>
            <a href="#ratings"      className="lnd-nav-link">Colour system</a>
            <a href="#pricing"      className="lnd-nav-link">Pricing</a>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ThemeToggle />
            <Link to={loggedIn ? '/dashboard' : '/auth'} className="lnd-btn-sm" style={{ background: 'var(--lnd-t06)', color: 'var(--lnd-t80)', border: '1px solid var(--lnd-t10)' }}>
              {loggedIn ? 'Dashboard' : 'Sign in'}
            </Link>
            {!loggedIn && (
              <Link to="/auth" className="lnd-btn-sm" style={{ background: '#1B4332', color: '#fff', boxShadow: '0 0 0 1px rgba(82,183,136,0.3)' }}>
                Get started
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '60px 24px 64px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(27,67,50,0.45) 0%, rgba(82,183,136,0.1) 50%, transparent 70%)', pointerEvents: 'none', animation: 'pulseGlow 5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(212,160,23,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '8%', width: 250, height: 250, background: 'radial-gradient(ellipse, rgba(82,183,136,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', animation: 'fadeInUp 0.7s ease' }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52B788', animation: 'pulseGlow 2s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: '#52B788', fontWeight: 600, letterSpacing: '0.01em' }}>Built for Ghana</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em', color: 'var(--lnd-text)' }}>
            Understand your<br />
            <span style={{ color: '#52B788', position: 'relative', display: 'inline-block', paddingBottom: 4 }}>
              <RotatingWord />
              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #1B4332, #52B788, #1B4332)', borderRadius: 2, opacity: 0.6 }} />
            </span>
            <br />
            <span style={{ color: 'var(--lnd-t90)' }}>before you sign.</span>
          </h1>

          {/* Subtext */}
          <p style={{ color: 'var(--lnd-t50)', fontSize: 18, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
            Land agreements, music contracts, employment letters, loan forms —
            Klaro reads every clause and flags the dangerous parts.
            <strong style={{ color: 'var(--lnd-t75)' }}> No lawyer needed.</strong>
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            <Link to={loggedIn ? '/upload' : '/auth'} className="lnd-btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>
              Analyse a document free →
            </Link>
            <a href="#demo" className="lnd-btn-ghost" style={{ fontSize: 16, padding: '16px 32px' }}>
              See it in action
            </a>
          </div>

          {/* Trust */}
          <div className="hero-trust" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', color: 'var(--lnd-t28)', fontSize: 13 }}>
            <span>✓ 3 free analyses</span>
            <span>✓ No credit card required</span>
            <span>✓ Results in under 30 seconds</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ borderTop: '1px solid var(--lnd-t06)', borderBottom: '1px solid var(--lnd-t06)', padding: '36px 16px' }}>
        <div className="stats-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '12px' }}>
          {[
            { value: '40+',   label: 'Document types' },
            { value: '15+',   label: 'Ghana laws covered' },
            { value: '< 30s', label: 'Average analysis time' },
            { value: '7',     label: 'Languages supported' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <p className="stat-value" style={{ fontSize: 34, fontWeight: 900, color: '#52B788', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p className="stat-label" style={{ fontSize: 13, color: 'var(--lnd-t40)', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ghana laws marquee ── */}
      <section style={{ padding: '28px 0', borderBottom: '1px solid var(--lnd-t06)' }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--lnd-t25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Built on real Ghana law
        </p>
        <Marquee />
      </section>

      {/* ── Browser Mockup (demo) ── */}
      <section id="demo" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(27,67,50,0.4)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: 20, padding: '5px 16px', marginBottom: 18 }}>
              <span style={{ fontSize: 13, color: '#52B788', fontWeight: 600 }}>Live demo</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 14px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              See Klaro in action
            </h2>
            <p style={{ color: 'var(--lnd-t45)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Watch as Klaro scans an employment contract and colour-codes every clause in real time.
            </p>
          </div>
          <div style={{ animation: 'floatUp 7s ease-in-out infinite' }}>
            <BrowserMockup />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '80px 24px', borderTop: '1px solid var(--lnd-t06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-block', background: 'rgba(27,67,50,0.35)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#52B788', fontWeight: 600 }}>How Klaro works</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.12, margin: 0, letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              Three steps to understanding<br />
              <span style={{ color: '#52B788' }}>what you're signing</span>
            </h2>
          </div>
          <div className="steps-grid" style={{ display: 'flex', gap: 16 }}>
            <StepCard num={1} icon="📎" title="Upload your document" desc="Drop a PDF or paste the text. Your document is processed privately — nothing is stored without your permission." />
            <StepCard num={2} icon="🧠" title="Klaro AI analyses it"  desc="Claude AI reads every clause and checks it against Ghana's Labour Act, Lands Act, Rent Act, and 12+ other laws." />
            <StepCard num={3} icon="🎯" title="See what matters"      desc="Every clause gets a colour rating. RED means danger. BLUE means it's your right. GREEN means it's standard." />
          </div>
        </div>
      </section>

      {/* ── Colour system ── */}
      <section id="ratings" style={{ padding: '80px 24px', borderTop: '1px solid var(--lnd-t06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: 'var(--lnd-t04)', border: '1px solid var(--lnd-t08)', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--lnd-t60)', fontWeight: 600 }}>The colour system</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              See the risk at a glance
            </h2>
            <p style={{ color: 'var(--lnd-t40)', fontSize: 16 }}>Every clause is colour-coded so you always know where you stand.</p>
          </div>
          <div className="ratings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {RATINGS.map((r) => (
              <div key={r.label} className="rating-card" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: r.color, letterSpacing: '0.08em' }}>{r.label}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--lnd-text)', marginBottom: 6 }}>{r.sub}</p>
                <p style={{ fontSize: 12, color: 'var(--lnd-t45)', margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '80px 24px', borderTop: '1px solid var(--lnd-t06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-block', background: 'rgba(27,67,50,0.35)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#52B788', fontWeight: 600 }}>Pricing</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>Simple, fair pricing</h2>
            <p style={{ color: 'var(--lnd-t40)', fontSize: 16 }}>Start free. Pay only when you need more.</p>
          </div>

          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { name: 'Free Trial',   price: 'Free',      period: '',     features: ['3 document analyses', 'English only', 'Colour-coded results', 'No card required'],                          popular: false },
              { name: 'Pay Per Doc',  price: 'GH₵ 25–55', period: '/doc', features: ['Pay only when you need it', 'All 7 languages', 'Full clause history', 'From GH₵ 25 per doc'],             popular: false },
              { name: 'Individual',   price: 'GH₵ 89',    period: '/mo',  features: ['5 analyses per month', 'Ask Klaro AI questions', 'All 7 languages', 'Full history & export'],              popular: true  },
              { name: 'Professional', price: 'GH₵ 199',   period: '/mo',  features: ['Unlimited analyses', 'Ask Klaro AI questions', 'PDF export', 'Priority support'],                          popular: false },
            ].map((plan) => (
              <div key={plan.name} className="pricing-card" style={{
                background: plan.popular ? 'rgba(27,67,50,0.35)' : 'var(--lnd-t02)',
                border: `1px solid ${plan.popular ? 'rgba(82,183,136,0.4)' : 'var(--lnd-t08)'}`,
                borderRadius: 20, padding: '28px 24px', position: 'relative',
                boxShadow: plan.popular ? '0 0 40px rgba(27,67,50,0.3)' : 'none',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1B4332', border: '1px solid rgba(82,183,136,0.4)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                    MOST POPULAR
                  </div>
                )}
                <p style={{ fontSize: 14, color: plan.popular ? '#52B788' : 'var(--lnd-t50)', fontWeight: 700, marginBottom: 8 }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--lnd-text)' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: 'var(--lnd-t35)' }}>{plan.period}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--lnd-t08)', paddingTop: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#52B788', fontSize: 13 }}>✓</span>
                      <span style={{ fontSize: 13, color: 'var(--lnd-t55)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to={loggedIn ? '/upload' : '/auth'} style={{
                  display: 'block', textAlign: 'center', padding: '11px', borderRadius: 12,
                  background: plan.popular ? '#1B4332' : 'var(--lnd-t05)',
                  border: `1px solid ${plan.popular ? 'rgba(82,183,136,0.4)' : 'var(--lnd-t10)'}`,
                  color: plan.popular ? '#fff' : 'var(--lnd-t80)',
                  fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  {plan.price === 'Free' ? 'Start free' : 'Get started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(27,67,50,0.4) 0%, rgba(82,183,136,0.06) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
            Ready to understand<br />
            <span style={{ color: '#52B788' }}>what you sign?</span>
          </h2>
          <p style={{ color: 'var(--lnd-t45)', fontSize: 18, marginBottom: 40 }}>
            Start with 3 free analyses. No credit card, no lawyer needed.
          </p>
          <Link to={loggedIn ? '/upload' : '/auth'} className="lnd-btn-primary" style={{ fontSize: 16, padding: '18px 40px' }}>
            Analyse your first document free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--lnd-t06)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, marginBottom: 40 }}>

            <div style={{ maxWidth: 280 }}>
              <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 46, objectFit: 'contain', marginBottom: 12 }} />
              <p style={{ color: 'var(--lnd-t35)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Klaro explains legal documents. It does not give legal advice.
                For advice on what to do, consult a qualified Ghana lawyer.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Product</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a href="#how-it-works" className="lnd-footer-link">How it works</a>
                  <a href="#ratings"      className="lnd-footer-link">Colour system</a>
                  <a href="#pricing"      className="lnd-footer-link">Pricing</a>
                  <Link to="/auth"        className="lnd-footer-link">Sign in</Link>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/privacy" className="lnd-footer-link">Privacy Policy</Link>
                  <Link to="/terms"   className="lnd-footer-link">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--lnd-t06)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ color: 'var(--lnd-t20)', fontSize: 13, margin: 0 }}>
              Built in Ghana for Africa © {new Date().getFullYear()} Klaro Technologies
            </p>
            <p style={{ color: 'var(--lnd-t15)', fontSize: 13, margin: 0 }}>
              Powered by Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
