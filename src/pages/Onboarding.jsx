import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getUser, getToken, setSession } from '../lib/auth';

// ─── Supported countries ──────────────────────────────────────────────────────

const SUPPORTED_COUNTRIES = [
  { code: 'GH', iso: 'gh', name: 'Ghana'         },
  { code: 'NG', iso: 'ng', name: 'Nigeria'        },
  { code: 'ZA', iso: 'za', name: 'South Africa'   },
  { code: 'KE', iso: 'ke', name: 'Kenya'          },
  { code: 'RW', iso: 'rw', name: 'Rwanda'         },
  { code: 'CI', iso: 'ci', name: "Côte d'Ivoire"  },
  { code: 'SN', iso: 'sn', name: 'Senegal'        },
  { code: 'EG', iso: 'eg', name: 'Egypt'          },
  { code: 'TZ', iso: 'tz', name: 'Tanzania'       },
];

// ─── Slide illustrations ──────────────────────────────────────────────────────

function IllustrationWelcome() {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '1px solid rgba(82,183,136,0.15)', animation: 'onb-ring 3s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: -48, borderRadius: '50%', border: '1px solid rgba(82,183,136,0.08)', animation: 'onb-ring 3s ease-in-out infinite 0.5s' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,67,50,0.8) 0%, rgba(82,183,136,0.2) 50%, transparent 75%)', filter: 'blur(20px)' }} />
      <div style={{ position: 'relative', width: 200, height: 200, borderRadius: '40px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(82,183,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(27,67,50,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        <img src="/assets/logos/logo.png" alt="Klaro" style={{ width: 140, height: 140, objectFit: 'contain' }} />
      </div>
    </div>
  );
}

function IllustrationUpload() {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,67,50,0.6) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ position: 'relative', width: 110, height: 140 }}>
          {[12, 6].map((offset, i) => (
            <div key={i} style={{ position: 'absolute', top: offset, left: offset / 2, right: -offset / 2, bottom: -offset, borderRadius: 12, background: 'rgba(82,183,136,0.08)', border: '1px solid rgba(82,183,136,0.12)' }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(82,183,136,0.3)', backdropFilter: 'blur(10px)', padding: '18px 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            {[1, 0.6, 0.8, 0.5, 0.7, 0.4].map((w, i) => (
              <div key={i} style={{ height: 6, borderRadius: 3, background: `rgba(82,183,136,${i === 0 ? 0.6 : 0.2})`, marginBottom: 10, width: `${w * 100}%` }} />
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, animation: 'onb-bounce 1.8s ease-in-out infinite' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V8M12 8L8 12M12 8L16 12" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IllustrationColors() {
  const ratings = [
    { color: '#22c55e', label: 'STANDARD',    bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)' },
    { color: '#eab308', label: 'ATTENTION',   bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)' },
    { color: '#ef4444', label: 'DANGER',      bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
    { color: '#3b82f6', label: 'YOUR RIGHTS', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  ];
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,67,50,0.5) 0%, transparent 70%)', filter: 'blur(25px)' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {ratings.map(({ color, label, bg, border }, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '8px 12px', animation: `onb-slidein 0.4s ease ${i * 0.1}s both` }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
            <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: '0.08em' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IllustrationAfrica() {
  const isos = ['gh', 'ng', 'za', 'ke', 'rw', 'ci', 'sn', 'eg', 'tz'];
  return (
    <div style={{ position: 'relative', width: 200, height: 160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(82,183,136,0.2) 0%, rgba(27,67,50,0.35) 40%, transparent 70%)', filter: 'blur(20px)' }} />
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, justifyItems: 'center', alignItems: 'center' }}>
        {isos.map((iso, i) => (
          <div key={iso} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))', animation: `onb-slidein 0.3s ease ${i * 0.06}s both` }}>
            <img src={`https://flagcdn.com/40x30/${iso}.png`} width="40" height="30" alt={iso} style={{ borderRadius: 5, display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slides data ──────────────────────────────────────────────────────────────

const SLIDES = [
  {
    illustration: <IllustrationWelcome />,
    badge: 'Know before you sign',
    title: 'Know before\nyou sign.',
    desc: "Every day, Africans sign contracts they don't fully understand, losing money, land, and rights. Klaro reads your documents and explains every clause in plain language.",
    accent: '#52B788',
  },
  {
    illustration: <IllustrationUpload />,
    badge: '40+ document types',
    title: 'Upload any\nlegal document.',
    desc: 'Land agreements, employment letters, loan forms, rental agreements, music contracts. Upload a PDF, Word document, or paste the text — Klaro does the rest.',
    accent: '#52B788',
  },
  {
    illustration: <IllustrationColors />,
    badge: 'Colour-coded results',
    title: 'See risk\nat a glance.',
    desc: 'Every clause gets a colour. GREEN is normal. YELLOW needs attention. RED is dangerous. BLUE means it gives you rights. No legal knowledge needed.',
    accent: '#52B788',
  },
  {
    illustration: <IllustrationAfrica />,
    badge: '9 countries & counting',
    title: 'Where are\nyou based?',
    desc: 'Select your country so Klaro uses the right local laws and shows prices in your currency.',
    accent: '#52B788',
    selector: true,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent]                 = useState(0);
  const [exiting, setExiting]                 = useState(false);
  const [dir,     setDir]                     = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(() => getUser()?.country || null);
  const [saving, setSaving]                   = useState(false);
  const touchStartX = useRef(null);
  const isLast = current === SLIDES.length - 1;

  async function complete() {
    if (isLast && !selectedCountry) return;
    if (selectedCountry) {
      setSaving(true);
      try {
        await api.profile.update({ country: selectedCountry });
        const u = getUser();
        if (u) setSession(getToken(), { ...u, country: selectedCountry });
      } catch {
        // Non-blocking — country can be updated later in profile
      }
      setSaving(false);
    }
    localStorage.setItem('klaro_onboarded', 'true');
    navigate('/upload');
  }

  const goTo = useCallback((index) => {
    if (index === current || exiting) return;
    setDir(index > current ? 1 : -1);
    setExiting(true);
    setTimeout(() => {
      setCurrent(index);
      setExiting(false);
    }, 280);
  }, [current, exiting]);

  function next() {
    if (isLast) { complete(); return; }
    goTo(current + 1);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, goTo, selectedCountry]);

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) next();
    else if (dx > 50 && current > 0) goTo(current - 1);
  }

  const slide = SLIDES[current];

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ minHeight: '100vh', background: '#070f0a', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', userSelect: 'none' }}
    >
      <style>{`
        @keyframes onb-ring    { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.06);opacity:1} }
        @keyframes onb-bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes onb-slidein { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes onb-in      { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes onb-out     { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-20px)} }
        @keyframes onb-glow    { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .onb-slide-in  { animation: onb-in  0.32s cubic-bezier(0,0,0.2,1) both; }
        .onb-slide-out { animation: onb-out 0.26s cubic-bezier(0.4,0,1,1) both; }
      `}</style>

      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(27,67,50,0.5) 0%, rgba(82,183,136,0.08) 50%, transparent 70%)', pointerEvents: 'none', animation: 'onb-glow 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(82,183,136,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 0', position: 'relative', zIndex: 10 }}>
        <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 36, objectFit: 'contain', opacity: 0.9 }} />
        <button
          onClick={complete}
          style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 8, transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
        >
          Skip
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '16px 28px 0', position: 'relative', zIndex: 10 }}>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((current + 1) / SLIDES.length) * 100}%`, background: 'linear-gradient(90deg, #1B4332, #52B788)', borderRadius: 2, transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      </div>

      {/* Slide content */}
      <div
        className={exiting ? 'onb-slide-out' : 'onb-slide-in'}
        key={current}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: slide.selector ? 'flex-start' : 'center', padding: slide.selector ? '20px 28px 0' : '32px 28px', textAlign: 'center', position: 'relative', zIndex: 10, overflowY: slide.selector ? 'auto' : 'visible' }}
      >
        {/* Illustration */}
        <div style={{ marginBottom: slide.selector ? 16 : 40 }}>
          {slide.illustration}
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: slide.accent, animation: 'onb-glow 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: slide.accent, letterSpacing: '0.04em' }}>{slide.badge}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: slide.selector ? 'clamp(24px, 6vw, 32px)' : 'clamp(30px, 8vw, 42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 12, whiteSpace: 'pre-line' }}>
          {slide.title}
        </h1>

        {/* Description */}
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', maxWidth: 320, margin: '0 auto' }}>
          {slide.desc}
        </p>

        {/* Country picker */}
        {slide.selector && (
          <div style={{ width: '100%', maxWidth: 360, margin: '18px auto 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {SUPPORTED_COUNTRIES.map(({ code, iso, name }) => (
                <button
                  key={code}
                  onClick={() => setSelectedCountry(code)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    background: selectedCountry === code ? 'rgba(82,183,136,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedCountry === code ? 'rgba(82,183,136,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12, padding: '10px 6px', cursor: 'pointer',
                    transition: 'all 0.2s', outline: 'none',
                    boxShadow: selectedCountry === code ? '0 0 14px rgba(82,183,136,0.25)' : 'none',
                  }}
                >
                  <img
                    src={`https://flagcdn.com/40x30/${iso}.png`}
                    width="40" height="30"
                    alt={name}
                    style={{ borderRadius: 4, display: 'block', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
                  />
                  <span style={{ fontSize: 10, color: selectedCountry === code ? '#52B788' : 'rgba(255,255,255,0.45)', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{name}</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, marginTop: 12, textAlign: 'center', color: selectedCountry ? 'rgba(82,183,136,0.55)' : 'rgba(255,255,255,0.22)' }}>
              {selectedCountry ? 'You can change this anytime in your profile.' : 'Select your country to continue'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{ padding: '0 28px 44px', position: 'relative', zIndex: 10, flexShrink: 0 }}>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{ height: 6, width: i === current ? 24 : 6, borderRadius: 3, background: i === current ? '#52B788' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', boxShadow: i === current ? '0 0 10px rgba(82,183,136,0.6)' : 'none' }}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={next}
          disabled={(isLast && !selectedCountry) || saving}
          style={{
            width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            background: (isLast && !selectedCountry) ? 'rgba(27,67,50,0.3)' : 'linear-gradient(135deg, #1B4332 0%, #2d6a4f 100%)',
            color: '#ffffff', fontWeight: 700, fontSize: 16, padding: '17px 28px', borderRadius: 18,
            border: `1px solid ${(isLast && !selectedCountry) ? 'rgba(82,183,136,0.1)' : 'rgba(82,183,136,0.4)'}`,
            cursor: (isLast && !selectedCountry) || saving ? 'not-allowed' : 'pointer',
            boxShadow: (isLast && !selectedCountry) ? 'none' : '0 0 0 1px rgba(82,183,136,0.2), 0 8px 32px rgba(27,67,50,0.6)',
            transition: 'all 0.2s', letterSpacing: '-0.01em',
            opacity: (isLast && !selectedCountry) ? 0.4 : 1,
          }}
          onMouseEnter={e => { if (!(isLast && !selectedCountry) && !saving) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(82,183,136,0.5), 0 16px 48px rgba(27,67,50,0.8)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(82,183,136,0.2), 0 8px 32px rgba(27,67,50,0.6)'; }}
          onTouchStart={e => { if (!(isLast && !selectedCountry)) e.currentTarget.style.transform = 'scale(0.97)'; }}
          onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {saving ? (
            'Setting up…'
          ) : isLast ? (
            <>
              Get started for free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          ) : (
            <>
              Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 16, letterSpacing: '0.05em' }}>
          {current + 1} of {SLIDES.length}
        </p>
      </div>
    </div>
  );
}
