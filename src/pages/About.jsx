import React from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../lib/auth';
import { useLang } from '../context/LangContext';

const COUNTRIES = [
  { code: 'GH', iso: 'gh', name: 'Ghana' },
  { code: 'NG', iso: 'ng', name: 'Nigeria' },
  { code: 'ZA', iso: 'za', name: 'South Africa' },
  { code: 'KE', iso: 'ke', name: 'Kenya' },
  { code: 'RW', iso: 'rw', name: 'Rwanda' },
  { code: 'CI', iso: 'ci', name: "Côte d'Ivoire" },
  { code: 'SN', iso: 'sn', name: 'Senegal' },
  { code: 'EG', iso: 'eg', name: 'Egypt' },
  { code: 'TZ', iso: 'tz', name: 'Tanzania' },
];

const VALUES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Access for everyone',
    body: 'Legal clarity should not depend on how much you earn. Klaro makes professional-grade document analysis available to anyone with a phone — whether you are in Accra, Lagos, Nairobi, or Cairo.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    title: 'Built for African law',
    body: 'Our analysis is grounded in real African legislation — not adapted from Western templates. We reference the actual statutes for each of the 9 countries we cover, updated in real time via live search.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    title: 'Your language',
    body: 'Legal documents come in the language of power. Klaro explains them in yours. We support 10 languages: English, French, Arabic, Swahili, Twi, Hausa, Ga, Ewe, Dagbani, and Fante.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    title: 'Privacy by design',
    body: 'Your documents are yours. Klaro processes your file for analysis and nothing is stored without your explicit consent. We never sell your data or use your documents to train models.',
  },
];

const TIMELINE = [
  { year: '2024', label: 'Problem identified', detail: 'Founder Emmanuel Tete Boye observes that clients and colleagues routinely sign employment and tenancy contracts without understanding critical clauses — not from carelessness, but because legal language is deliberately opaque.' },
  { year: '2024', label: 'Okyeame is born', detail: 'The first version launches as Okyeame — named after the traditional Ghanaian royal spokesperson, the one who translates the chief\'s words into language the people understand.' },
  { year: '2025', label: 'Becomes Klaro', detail: 'The product is renamed Klaro — from the Portuguese and Spanish word for "clear" — as coverage expands beyond Ghana to serve 9 African countries in 10 languages.' },
];

const TECH = [
  { label: 'Gemini 2.5 Flash', sub: 'Primary AI — analyses clauses and explains them in plain language with live law search.' },
  { label: 'Google Search Grounding', sub: 'Every analysis queries live legislation so results reflect current law, not cached data.' },
  { label: 'Claude AI', sub: 'Fallback AI — provides continuity when Gemini is unavailable.' },
  { label: 'Cloudflare Workers', sub: 'Edge-deployed backend for fast response times across African regions.' },
  { label: 'Neon PostgreSQL', sub: 'Serverless database for user data, document history, and verified lawyer profiles.' },
  { label: 'Paystack', sub: 'Local payment processing — accepts GHS, NGN, ZAR, KES, XOF, EGP in local currency.' },
];

export default function About() {
  const loggedIn = isLoggedIn();

  return (
    <div style={{ background: '#070f0a', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <style>{`
        .abt-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 12px; border-radius: 9px; transition: all 0.15s; }
        .abt-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .abt-section { padding: 80px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .abt-section-sm { padding: 56px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .abt-inner { max-width: 900px; margin: 0 auto; }
        .abt-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #52B788; margin-bottom: 16px; }
        .abt-h2 { font-size: clamp(26px, 3.5vw, 40px); font-weight: 900; line-height: 1.15; letter-spacing: -0.025em; color: #fff; margin: 0 0 16px; }
        .abt-body { font-size: 16px; line-height: 1.75; color: rgba(255,255,255,0.55); margin: 0; }
        .abt-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 24px; }
        .abt-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(82,183,136,0.18); transition: all 0.2s; }
        .abt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .abt-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 768px) {
          .abt-section { padding: 56px 20px; }
          .abt-grid-2 { grid-template-columns: 1fr; }
          .abt-grid-3 { grid-template-columns: 1fr 1fr; }
          .abt-hero-text { font-size: clamp(32px, 8vw, 52px) !important; }
          .abt-team-wrap { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .abt-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,15,10,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/">
            <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 36, objectFit: 'contain' }} />
          </Link>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Link to="/" className="abt-link">Home</Link>
            <Link to="/privacy" className="abt-link">Privacy</Link>
            <Link to={loggedIn ? '/upload' : '/auth'} style={{
              display: 'inline-flex', alignItems: 'center', padding: '8px 18px',
              borderRadius: 11, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              background: '#1B4332', color: '#fff',
              boxShadow: '0 0 0 1px rgba(82,183,136,0.3), 0 2px 10px rgba(27,67,50,0.4)',
            }}>
              {loggedIn ? 'Dashboard →' : 'Try Klaro free →'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(27,67,50,0.5) 0%, rgba(82,183,136,0.08) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="abt-label" style={{ marginBottom: 20 }}>About Klaro</div>
          <h1 className="abt-hero-text" style={{ fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', marginBottom: 24 }}>
            Built to protect Africans<br />
            <span style={{ color: '#52B788' }}>from documents they shouldn't sign</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.52)', maxWidth: 600, margin: '0 auto 40px' }}>
            Klaro started with a simple observation: millions of Africans sign contracts, loan forms, and tenancy agreements they don't fully understand — not because they aren't careful, but because legal language is designed to be hard to read.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>9 countries</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>10 languages</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>40+ document types</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>&lt;30s analysis</span>
          </div>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            <div>
              <p className="abt-label">The problem</p>
              <h2 className="abt-h2">Most people sign documents they don't understand</h2>
            </div>
            <div style={{ paddingTop: 8 }}>
              <p className="abt-body" style={{ marginBottom: 20 }}>
                In Africa, signing a contract you don't understand isn't rare — it's common. Employment letters with hidden penalty clauses. Tenancy agreements that waive your right to notice. Loan documents with compounding interest buried in paragraph fourteen. Most people sign anyway, because reading legal language feels impossible without a law degree, and hiring a lawyer is expensive.
              </p>
              <p className="abt-body" style={{ marginBottom: 20 }}>
                The result is predictable: people lose jobs, homes, and savings to terms they unknowingly agreed to. When they find out what the document actually said, it's already too late.
              </p>
              <p className="abt-body">
                This isn't a knowledge problem. It's an access problem. The same protections that wealthy people receive from their legal teams should be available to everyone. That is why Klaro exists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Klaro does ──────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="abt-label">What we do</p>
            <h2 className="abt-h2">An AI that reads the fine print so you don't have to</h2>
            <p className="abt-body" style={{ maxWidth: 560, margin: '0 auto' }}>
              Upload any contract, agreement, or legal document. Klaro reads every clause, checks it against your country's actual laws, and explains it in plain language — in seconds.
            </p>
          </div>
          <div className="abt-grid-3" style={{ gap: 12, marginBottom: 12 }}>
            {[
              { color: '#ef4444', label: 'RED — Danger', desc: 'Clauses that are potentially harmful, unlawful, or that strip your rights. These need attention before you sign.' },
              { color: '#3b82f6', label: 'BLUE — Your rights', desc: 'Clauses that specifically protect you or grant you a legal right under your country\'s law.' },
              { color: '#22c55e', label: 'GREEN — Standard', desc: 'Normal and fair clauses. Common across the industry and consistent with local law.' },
              { color: '#eab308', label: 'YELLOW — Attention', desc: 'Unusual or one-sided terms that aren\'t necessarily illegal but deserve a closer look.' },
              { color: '#9ca3af', label: 'GREY — Boilerplate', desc: 'Standard legal filler — definitions, jurisdiction clauses, standard notices. Safe to skim.' },
            ].map((r) => (
              <div key={r.label} className="abt-card" style={{ background: 'transparent', border: `1px solid ${r.color}25` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: r.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: r.color, letterSpacing: '0.06em' }}>{r.label}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="abt-label">Our values</p>
            <h2 className="abt-h2">What drives every decision we make</h2>
          </div>
          <div className="abt-grid-2">
            {VALUES.map((v) => (
              <div key={v.title} className="abt-card">
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(27,67,50,0.4)', border: '1px solid rgba(82,183,136,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story / Timeline ─────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="abt-label">Our story</p>
            <h2 className="abt-h2">From a frustration to a platform</h2>
          </div>
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'rgba(82,183,136,0.2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {TIMELINE.map((item, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div style={{ position: 'absolute', left: -29, top: 4, width: 15, height: 15, borderRadius: '50%', background: i === TIMELINE.length - 1 ? '#52B788' : 'rgba(82,183,136,0.25)', border: `1px solid ${i === TIMELINE.length - 1 ? '#52B788' : 'rgba(82,183,136,0.4)'}` }} />
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#52B788', letterSpacing: '0.1em' }}>{item.year}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{item.label}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: 0 }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Countries ────────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="abt-label">Coverage</p>
            <h2 className="abt-h2">9 African countries</h2>
            <p className="abt-body" style={{ maxWidth: 480, margin: '0 auto' }}>
              Each country's analysis is grounded in that country's specific legislation — not a generic interpretation. More countries are on the roadmap.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {COUNTRIES.map(({ iso, name }) => (
              <div key={iso} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px' }}>
                <img src={`https://flagcdn.com/32x24/${iso}.png`} width="28" height="21" alt={name} style={{ borderRadius: 4, display: 'block' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ───────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="abt-label">Technology</p>
            <h2 className="abt-h2">Built on real AI, not marketing buzzwords</h2>
            <p className="abt-body" style={{ maxWidth: 560, margin: '0 auto' }}>
              Klaro uses production AI models with live access to legal databases. Every analysis is grounded in current law, not a frozen snapshot. Here is what powers it.
            </p>
          </div>
          <div className="abt-grid-2">
            {TECH.map((t) => (
              <div key={t.label} style={{ display: 'flex', gap: 14, padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52B788', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{t.label}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages ────────────────────────────────────────────────────── */}
      <section className="abt-section-sm">
        <div className="abt-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <p className="abt-label">Languages</p>
              <h2 className="abt-h2" style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>
                10 languages, including the ones your contract won't be written in
              </h2>
              <p className="abt-body">
                Legal documents rarely come in Twi, Hausa, or Ga. Klaro's explanations do. We built multilingual support from day one because access to justice means access in the language you actually think in.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'English',   flag: 'gb' },
                { label: 'Français',  flag: 'fr' },
                { label: 'العربية',   flag: 'eg' },
                { label: 'Kiswahili', flag: 'tz' },
                { label: 'Twi',       flag: 'gh' },
                { label: 'Hausa',     flag: 'ng' },
                { label: 'Ga',        flag: 'gh' },
                { label: 'Ewe',       flag: 'gh' },
                { label: 'Dagbani',   flag: 'gh' },
                { label: 'Fante',     flag: 'gh' },
              ].map(({ label, flag }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '7px 12px' }}>
                  <img src={`https://flagcdn.com/20x15/${flag}.png`} width="18" height="13" alt={label} style={{ borderRadius: 2, display: 'block' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="abt-label">The developer</p>
            <h2 className="abt-h2">Made in Ghana, built for Africa</h2>
          </div>
          <div className="abt-team-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            {/* Left — founder photo */}
            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(82,183,136,0.18)', boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.55)' }}>
                <img
                  src="/assets/img/dm-me.jpeg"
                  alt="Emmanuel Tete Boye"
                  style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4/5' }}
                />
              </div>
              {/* Floating tag */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(7,15,10,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Emmanuel Tete Boye</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>Founder · Tboye Creative Solutions</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="https://flagcdn.com/24x18/gh.png" width="20" height="15" alt="Ghana" style={{ borderRadius: 2, display: 'block' }} />
                </div>
              </div>
            </div>

            {/* Right — bio */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#52B788', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                ELEVATE. BUILD. INSPIRE.
              </p>
              <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
                Software Developer &amp; Content Creator
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 16px' }}>
                Passionate about technology, innovation, and digital growth. Emmanuel built Klaro to bridge the gap between complex legal language and the everyday African, solving a problem he witnessed firsthand in his own community.
              </p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 28px' }}>
                Klaro is built and maintained by <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>Tboye Creative Solutions</strong>, based in Accra, Ghana, building digital products designed specifically for African needs.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href="https://wa.me/233593501488"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 12, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', textDecoration: 'none' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#25D366' }}>Give a DM</span>
                  <span style={{ fontSize: 12, color: 'rgba(37,211,102,0.55)', borderLeft: '1px solid rgba(37,211,102,0.2)', paddingLeft: 10 }}>+233 59 350 1488</span>
                </a>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ padding: '10px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                    📍 Accra, Ghana
                  </div>
                  <div style={{ padding: '10px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                    🛠 Tboye Creative Solutions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <section className="abt-section-sm">
        <div className="abt-inner">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 28px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Legal notice:</strong> Klaro explains documents and provides general legal information. It does not give legal advice and is not a substitute for a qualified lawyer. For important matters, always consult a licensed legal practitioner in your country. The analysis Klaro provides is AI-generated and may not account for all relevant facts, recent law changes, or the specific circumstances of your situation.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(27,67,50,0.45) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#fff', marginBottom: 14, lineHeight: 1.15 }}>
            Know before you sign.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 36 }}>
            3 free analyses. No credit card. Understand your document in under 30 seconds.
          </p>
          <Link to={loggedIn ? '/upload' : '/auth'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1B4332', color: '#fff', fontWeight: 700, fontSize: 15,
            padding: '16px 32px', borderRadius: 14, textDecoration: 'none',
            boxShadow: '0 0 0 1px rgba(82,183,136,0.3), 0 6px 24px rgba(27,67,50,0.5)',
          }}>
            Analyse a document free →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,0.20)', fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()}{' '}
            <a href="https://wa.me/233542510400" target="_blank" rel="noopener noreferrer" style={{ color: '#52B788', fontWeight: 700, textDecoration: 'none' }}>
              Tboye Creative Solutions
            </a>
          </p>
          <div style={{ display: 'flex', gap: 4 }}>
            <Link to="/"       className="abt-link">Home</Link>
            <Link to="/privacy" className="abt-link">Privacy</Link>
            <Link to="/terms"   className="abt-link">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
