import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../lib/auth';
import ThemeToggle from '../components/ThemeToggle';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DOCS = [
  { name: 'Employment_Contract.pdf', type: 'Employment Contract', date: 'Jun 2, 2026', risk: 'HIGH',   riskColor: '#ef4444', riskBg: '#fef2f2', riskBorder: '#fecaca', riskText: '#dc2626', strip: '#ef4444' },
  { name: 'Tenancy_Agreement.pdf',   type: 'Tenancy Agreement',   date: 'Jun 1, 2026', risk: 'MEDIUM', riskColor: '#f59e0b', riskBg: '#fffbeb', riskBorder: '#fde68a', riskText: '#b45309', strip: '#f59e0b' },
  { name: 'NDA_Agreement.pdf',       type: 'Non-Disclosure',      date: 'May 28, 2026',risk: 'LOW',    riskColor: '#22c55e', riskBg: '#f0fdf4', riskBorder: '#bbf7d0', riskText: '#16a34a', strip: '#22c55e' },
];

const MOCK_CLAUSES = [
  { text: 'Employee agrees to a 36-month non-compete clause covering all of West Africa.', rating: 'RED',  label: 'DANGER',      explanation: 'Non-compete over 24 months is extreme and likely unenforceable in Ghana.', color: '#ef4444', lightBg: '#fef2f2', lightBorder: '#fecaca', lightText: '#dc2626' },
  { text: 'Employee is entitled to 15 working days of annual leave per calendar year.',    rating: 'BLUE', label: 'YOUR RIGHTS',  explanation: 'This matches the Ghana Labour Act minimum. This clause protects you.',     color: '#3b82f6', lightBg: '#eff6ff', lightBorder: '#bfdbfe', lightText: '#2563eb' },
  { text: 'Employer may terminate employment at any time without notice or reason.',       rating: 'RED',  label: 'DANGER',       explanation: 'Ghana Labour Act requires 1-2 months notice minimum. This waives your rights.', color: '#ef4444', lightBg: '#fef2f2', lightBorder: '#fecaca', lightText: '#dc2626' },
  { text: 'Monthly salary of GHS 4,500 payable on the last working day of each month.',   rating: 'GREEN',label: 'STANDARD',     explanation: 'Clear salary terms with standard payment schedule. Nothing unusual here.',   color: '#22c55e', lightBg: '#f0fdf4', lightBorder: '#bbf7d0', lightText: '#16a34a' },
];

// ─── Shared inner Navbar ──────────────────────────────────────────────────────

function MockNavbar({ activeTab = 'Dashboard' }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 16px', display: 'flex', alignItems: 'center', height: 44, gap: 14, flexShrink: 0 }}>
      <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 26, objectFit: 'contain', flexShrink: 0 }} />
      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {['Dashboard', 'Lawyers'].map((label) => (
          <div key={label} style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 500, color: label === activeTab ? '#1B4332' : '#9ca3af', background: label === activeTab ? '#f0f7f3' : 'transparent' }}>
            {label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ padding: '3px 10px', borderRadius: 8, background: '#1B4332', fontSize: 11, color: '#fff', fontWeight: 600 }}>+ Analyse</div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '2px solid #52B788', flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#1B4332"/>
            <path d="M12 80 Q12 58 40 58 Q68 58 68 80Z" fill="#0e2419"/>
            <rect x="35" y="50" width="10" height="10" rx="3" fill="#C68642"/>
            <ellipse cx="40" cy="32" rx="16" ry="18" fill="#C68642"/>
            <path d="M24 26 Q24 14 40 13 Q56 14 56 26 Q56 18 40 16 Q24 18 24 26Z" fill="#1a0a00"/>
            <ellipse cx="34" cy="31" rx="3" ry="3.5" fill="white"/>
            <ellipse cx="46" cy="31" rx="3" ry="3.5" fill="white"/>
            <circle cx="34.5" cy="31.5" r="2" fill="#1a0a00"/>
            <circle cx="46.5" cy="31.5" r="2" fill="#1a0a00"/>
            <path d="M35 41 Q40 44.5 45 41" stroke="#A0522D" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard phase ──────────────────────────────────────────────────────────

function DashboardView({ visibleDocs }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f9fafb', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MockNavbar activeTab="Dashboard" />
      <div style={{ padding: '16px 20px', flex: 1, overflow: 'hidden', maxWidth: 520, width: '100%', margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Hi, Kofi</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Your document analyses</p>
          </div>
          <div style={{ background: '#1B4332', color: '#fff', borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Analyse
          </div>
        </div>

        {/* Plan banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '9px 14px', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#1B4332', margin: 0 }}>Free trial: 2 analyses remaining</p>
            <p style={{ fontSize: 10, color: '#52B788', margin: 0 }}>Analyse a document or choose a plan.</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {[0,1,2].map((i) => (
              <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i < 1 ? '#1B4332' : '#bbf7d0' }} />
            ))}
          </div>
        </div>

        {/* Search + filter — one white card container */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '10px 12px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Search by document type or filename...</span>
            </div>
            <div style={{ background: '#1B4332', color: '#fff', borderRadius: 10, padding: '6px 12px', fontSize: 10, fontWeight: 600 }}>Search</div>
          </div>
          {/* Risk filter pills */}
          <div style={{ display: 'flex', gap: 5 }}>
            {[
              { label: 'All',    active: true,  dot: null,       activeBg: '#1B4332', activeText: '#fff' },
              { label: 'High',   active: false, dot: '#ef4444'  },
              { label: 'Medium', active: false, dot: '#f59e0b'  },
              { label: 'Low',    active: false, dot: '#22c55e'  },
            ].map(({ label, active, dot, activeBg, activeText }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500,
                background: active ? '#1B4332' : '#fff',
                color: active ? '#fff' : '#6b7280',
                border: `1px solid ${active ? '#1B4332' : '#e5e7eb'}`,
              }}>
                {dot && <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Month group header with extending line */}
        {visibleDocs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: 2 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, whiteSpace: 'nowrap' }}>This month</p>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 9, color: '#d1d5db', flexShrink: 0 }}>{visibleDocs.length} doc{visibleDocs.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Cards — ALL inside ONE white container with divide-y rows */}
        {visibleDocs.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
            {visibleDocs.map((doc, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderTop: i > 0 ? '1px solid #f3f4f6' : 'none',
                animation: 'previewSlideIn 0.3s ease',
              }}>
                {/* Thin risk strip */}
                <div style={{ width: 3, height: 36, borderRadius: 9999, background: doc.strip, flexShrink: 0 }} />
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.type}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                  <p style={{ fontSize: 9, color: '#d1d5db', margin: '2px 0 0' }}>{doc.date}</p>
                </div>
                {/* Risk badge + faint icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: doc.riskBg, border: `1px solid ${doc.riskBorder}`, borderRadius: 20, padding: '3px 8px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: doc.riskColor }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: doc.riskText }}>{doc.risk}</span>
                  </div>
                  {/* Rename + delete icons (faint, as they'd appear on hover) */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analysis phase ───────────────────────────────────────────────────────────

function AnalysisView({ visibleClauses, scanPct, scanning }) {
  const radius = 22; const circ = 2 * Math.PI * radius; const dash = 0.78 * circ;
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F8FAF7', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MockNavbar activeTab="Dashboard" />
      {/* Sub-bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f5f5f5', padding: '5px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#1B4332', fontWeight: 500 }}>← Dashboard</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ padding: '3px 8px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 10, color: '#6b7280' }}>Share</div>
          <div style={{ padding: '3px 8px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 10, color: '#6b7280' }}>Export PDF</div>
        </div>
      </div>

      {/* Two-column */}
      <div style={{ display: 'flex', gap: 10, padding: '10px 12px', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 155, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 13, padding: '11px 10px' }}>
            {/* Risk ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: 9 }}>
              <div style={{ position: 'relative', width: 54, height: 54 }}>
                <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="27" cy="27" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="5" />
                  <circle cx="27" cy="27" r={radius} fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔴</div>
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '2px 8px' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>High Risk</span>
              </div>
            </div>
            <p style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', margin: '0 0 3px' }}>Employment Contract</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#374151', textAlign: 'center', margin: '0 0 9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Employment_Contract.pdf</p>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 7, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { label: 'Dangerous', color: '#ef4444', text: '#dc2626', count: 2 },
                { label: 'Your rights', color: '#3b82f6', text: '#2563eb', count: 1 },
                { label: 'Standard', color: '#22c55e', text: '#16a34a', count: 1 },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 5px', borderRadius: 7, background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 9, color: item.text }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: item.text }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ask Klaro */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 13, padding: '9px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#111827' }}>Ask Klaro</p>
            </div>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 6px', fontSize: 9, color: '#9ca3af', marginBottom: 5, height: 26 }}>Ask about this document...</div>
            <div style={{ background: '#1B4332', borderRadius: 7, padding: '4px', textAlign: 'center', fontSize: 9, color: '#fff', fontWeight: 600 }}>Ask</div>
          </div>
        </div>

        {/* Right: clauses */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
          {/* Summary */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 13, padding: '10px 12px', flexShrink: 0 }}>
            <p style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Summary</p>
            {scanning ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Analysing with Klaro AI...</span>
                  <span style={{ fontSize: 10, color: '#D4A017', fontWeight: 600 }}>{scanPct}%</span>
                </div>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scanPct}%`, background: 'linear-gradient(90deg, #1B4332, #52B788)', borderRadius: 4, transition: 'width 0.025s linear' }} />
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.5 }}>
                This agreement contains clauses that may conflict with Ghana's Labour Act (Act 651). Review RED items before signing.
              </p>
            )}
          </div>

          {/* Filter pills */}
          {!scanning && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {[['All', '#111827', '#fff'], ['Danger', '#fff', '#ef4444'], ['Your rights', '#fff', '#3b82f6'], ['Standard', '#fff', '#22c55e']].map(([f, txtColor, dotColor], i) => (
                <div key={f} style={{ padding: '3px 9px', borderRadius: 20, background: i === 0 ? '#111827' : '#fff', color: i === 0 ? '#fff' : '#6b7280', fontSize: 9, fontWeight: 600, border: `1px solid ${i === 0 ? '#111827' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', gap: 3 }}>
                  {i > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor }} />}
                  {f}
                </div>
              ))}
            </div>
          )}

          {/* Clause cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
            {visibleClauses.map((c, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 11, display: 'flex', overflow: 'hidden', animation: 'previewSlideIn 0.3s ease' }}>
                <div style={{ width: 3, background: c.color, flexShrink: 0 }} />
                <div style={{ padding: '8px 10px', flex: 1 }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: c.lightText, background: c.lightBg, border: `1px solid ${c.lightBorder}`, borderRadius: 20, padding: '1px 6px' }}>{c.label}</span>
                  <p style={{ color: '#374151', fontSize: 10, margin: '4px 0 2px', lineHeight: 1.4, fontStyle: 'italic' }}>"{c.text.length > 55 ? c.text.slice(0, 55) + '…' : c.text}"</p>
                  <p style={{ color: '#6b7280', fontSize: 9.5, margin: 0, lineHeight: 1.4 }}>{c.explanation}</p>
                </div>
              </div>
            ))}
            {!scanning && visibleClauses.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40 }}>
                <div style={{ width: 14, height: 14, border: '2px solid #1B4332', borderTopColor: 'transparent', borderRadius: '50%', animation: 'previewSpin 0.8s linear infinite' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Combined preview controller ──────────────────────────────────────────────

function AnalysisPreview() {
  const [phase,         setPhase]         = useState('dashboard'); // 'dashboard' | 'analysis'
  const [visibleDocs,   setVisibleDocs]   = useState([]);
  const [visibleClauses,setVisibleClauses]= useState([]);
  const [scanning,      setScanning]      = useState(false);
  const [scanPct,       setScanPct]       = useState(0);
  const docIdxRef    = useRef(0);
  const clauseIdxRef = useRef(0);

  // Dashboard phase: add doc cards one by one, then switch to analysis
  useEffect(() => {
    if (phase !== 'dashboard') return;
    setVisibleDocs([]);
    docIdxRef.current = 0;
    const t = setInterval(() => {
      if (docIdxRef.current < MOCK_DOCS.length) {
        const i = docIdxRef.current;
        setVisibleDocs((prev) => [...prev, MOCK_DOCS[i]]);
        docIdxRef.current++;
      } else {
        clearInterval(t);
        setTimeout(() => {
          setPhase('analysis');
          setScanning(true);
          setScanPct(0);
        }, 1800);
      }
    }, 700);
    return () => clearInterval(t);
  }, [phase]);

  // Analysis phase: scan bar, then add clause cards
  useEffect(() => {
    if (phase !== 'analysis' || !scanning) return;
    setScanPct(0);
    let pct = 0;
    const t = setInterval(() => {
      pct += 2;
      setScanPct(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(t);
        setScanning(false);
        setVisibleClauses([]);
        clauseIdxRef.current = 0;
      }
    }, 25);
    return () => clearInterval(t);
  }, [phase, scanning]);

  useEffect(() => {
    if (phase !== 'analysis' || scanning) return;
    const t = setInterval(() => {
      if (clauseIdxRef.current < MOCK_CLAUSES.length) {
        const i = clauseIdxRef.current;
        setVisibleClauses((prev) => [...prev, MOCK_CLAUSES[i]]);
        clauseIdxRef.current++;
      } else {
        clearInterval(t);
        setTimeout(() => {
          setPhase('dashboard');
          setVisibleClauses([]);
        }, 3000);
      }
    }, 900);
    return () => clearInterval(t);
  }, [phase, scanning]);

  if (phase === 'dashboard') return <DashboardView visibleDocs={visibleDocs} />;
  return <AnalysisView visibleClauses={visibleClauses} scanPct={scanPct} scanning={scanning} />;
}

// ─── Mouse Cursor ─────────────────────────────────────────────────────────────

const CURSOR_WAYPOINTS = [
  { x: 340, y: 175, pause: 1200, click: false },  // hover over first doc card
  { x: 340, y: 175, pause: 900,  click: true  },  // click first doc card
  { x: 280, y: 120, pause: 1000, click: false },  // move to summary area
  { x: 480, y: 250, pause: 1100, click: false },  // move to clause area
  { x: 480, y: 310, pause: 900,  click: true  },  // click clause card
  { x: 150, y: 310, pause: 1000, click: false },  // move to sidebar
  { x: 150, y: 370, pause: 800,  click: false },  // hover Ask Klaro
  { x: 340, y: 65,  pause: 1200, click: false },  // back to nav
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
      <div className="step-icon-row" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(27,67,50,0.3)', border: '1px solid rgba(82,183,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
  { label: 'YELLOW', sub: 'Attention',   desc: 'Unusual. Read carefully before signing.', color: '#eab308', bg: 'rgba(234,179,8,0.07)',     border: 'rgba(234,179,8,0.2)' },
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
        @media (max-width: 768px) {
          .step-card { text-align: center !important; }
          .step-card .step-icon-row { justify-content: center !important; }
          .rating-card { text-align: center !important; }
          .rating-label-row { justify-content: center !important; }
          .pricing-card { text-align: center !important; }
          .pricing-price-row { justify-content: center !important; }
          .pricing-features { align-items: center !important; }
        }
        .pricing-card { transition: all 0.25s; }
        .pricing-card:hover { transform: translateY(-4px); }

        /* ── Footer links ── */
        .lnd-footer-link { color: var(--lnd-t45); font-size: 14px; text-decoration: none; transition: color 0.2s; display: block; }
        .lnd-footer-link:hover { color: var(--lnd-text); }
        .footer-logo { height: 72px; object-fit: contain; margin-bottom: 14px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .steps-grid    { flex-direction: column !important; }
          .stats-row     { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .ratings-grid  { grid-template-columns: 1fr 1fr !important; }
          .pricing-grid  { grid-template-columns: 1fr 1fr !important; }
          .lnd-hide-mobile { display: none !important; }
          .hero-ctas     { flex-direction: column !important; align-items: stretch !important; }
          .hero-trust    { justify-content: center !important; }
          .lnd-btn-primary, .lnd-btn-ghost { width: 100%; justify-content: center; }

          /* Footer — center everything on mobile */
          .footer-top    { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .footer-brand  { max-width: 100% !important; align-items: center !important; display: flex !important; flex-direction: column !important; }
          .footer-links  { justify-content: center !important; gap: 32px !important; width: 100%; }
          .footer-links-group { text-align: center !important; }
          .footer-bottom { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; }
          .footer-logo   { height: 60px !important; }

          /* Section headings — ensure they stay centered */
          .section-heading { text-align: center !important; }
        }
        @media (max-width: 480px) {
          .pricing-grid  { grid-template-columns: 1fr !important; }
          .ratings-grid  { grid-template-columns: 1fr !important; }
          .footer-links  { flex-direction: column !important; align-items: center !important; gap: 24px !important; }
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
            Land agreements, music contracts, employment letters, loan forms.
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
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.12, margin: 0, letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              Three steps to understanding<br />
              <span style={{ color: '#52B788' }}>what you're signing</span>
            </h2>
          </div>
          <div className="steps-grid" style={{ display: 'flex', gap: 16 }}>
            <StepCard num={1}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
              title="Upload your document"
              desc="PDF, Word, or paste the text directly. Processed securely — nothing stored without your consent." />
            <StepCard num={2}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>}
              title="Klaro AI analyses it"
              desc="Every clause is checked against Ghana's Labour Act, Lands Act, Rent Act, and 12+ other laws." />
            <StepCard num={3}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>}
              title="See what matters"
              desc="Every clause gets a colour rating. RED means danger. BLUE means it's your right. GREEN means it's standard." />
          </div>
        </div>
      </section>

      {/* ── Colour system ── */}
      <section id="ratings" style={{ padding: '80px 24px', borderTop: '1px solid var(--lnd-t06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              See the risk at a glance
            </h2>
            <p style={{ color: 'var(--lnd-t40)', fontSize: 16 }}>Every clause is colour-coded so you always know where you stand.</p>
          </div>
          <div className="ratings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {RATINGS.map((r) => (
              <div key={r.label} className="rating-card" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                <div className="rating-label-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
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
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>No subscription traps</h2>
            <p style={{ color: 'var(--lnd-t40)', fontSize: 16 }}>Start free. Pay per document, or go monthly — your call.</p>
          </div>

          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { name: 'Free Trial',   price: 'Free',      period: '',     features: ['3 document analyses', 'English only', 'Colour-coded results', 'No card required'],                          popular: false },
              { name: 'Pay Per Doc',  price: 'GH₵ 55',    period: '/doc', features: ['Pay only when you need it', 'All 7 languages', 'Full clause history', 'No subscription needed'],          popular: false },
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
                <div className="pricing-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--lnd-text)' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: 'var(--lnd-t35)' }}>{plan.period}</span>
                </div>
                <div className="pricing-features" style={{ borderTop: '1px solid var(--lnd-t08)', paddingTop: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            Most people sign<br />
            <span style={{ color: '#52B788' }}>without reading. Don't.</span>
          </h2>
          <p style={{ color: 'var(--lnd-t45)', fontSize: 18, marginBottom: 40 }}>
            3 free analyses — no card, no catch.
          </p>
          <Link to={loggedIn ? '/upload' : '/auth'} className="lnd-btn-primary" style={{ fontSize: 16, padding: '18px 40px' }}>
            Analyse your first document free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--lnd-t06)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="footer-top" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, marginBottom: 40 }}>

            <div className="footer-brand" style={{ maxWidth: 280 }}>
              <img src="/assets/logos/logo.png" alt="Klaro" className="footer-logo" />
              <p style={{ color: 'var(--lnd-t45)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Klaro is Ghana's AI-powered legal document explainer. We help ordinary Ghanaians understand
                contracts, tenancy agreements, employment letters, and more, in plain language and local languages.
              </p>
              <p style={{ color: 'var(--lnd-t25)', fontSize: 12, marginTop: 10 }}>
                Klaro explains. It does not give legal advice. Always consult a qualified Ghana lawyer before signing.
              </p>
            </div>

            <div className="footer-links" style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div className="footer-links-group">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Product</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a href="#how-it-works" className="lnd-footer-link">How it works</a>
                  <a href="#ratings"      className="lnd-footer-link">Colour system</a>
                  <a href="#pricing"      className="lnd-footer-link">Pricing</a>
                  <Link to="/auth"        className="lnd-footer-link">Sign in</Link>
                </div>
              </div>
              <div className="footer-links-group">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/privacy" className="lnd-footer-link">Privacy Policy</Link>
                  <Link to="/terms"   className="lnd-footer-link">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom" style={{ borderTop: '1px solid var(--lnd-t06)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ color: 'var(--lnd-t20)', fontSize: 13, margin: 0 }}>
              © {new Date().getFullYear()} Built by{' '}
              <a
                href="https://wa.me/233542510400"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#52B788', fontWeight: 700, textDecoration: 'none' }}
              >
                Tboye Creative Solutions
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
