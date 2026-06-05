import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearSession } from '../lib/auth';
import Navbar from '../components/Navbar';
import ClauseCard from '../components/ClauseCard';

const LANG_LABELS = { en: 'English', tw: 'Twi', ga: 'Ga', ewe: 'Ewe', dag: 'Dagbani', ha: 'Hausa', fan: 'Fante' };

const RISK_CONFIG = {
  HIGH:   { label: 'High Risk',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '🔴', textColor: 'text-red-700',    badgeBg: 'bg-red-100',    badgeBorder: 'border-red-200'    },
  MEDIUM: { label: 'Review',      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '🟡', textColor: 'text-amber-700',  badgeBg: 'bg-amber-100',  badgeBorder: 'border-amber-200'  },
  LOW:    { label: 'Standard',    color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: '🟢', textColor: 'text-green-700',  badgeBg: 'bg-green-100',  badgeBorder: 'border-green-200'  },
};

const CLAUSE_FILTERS = [
  { key: 'ALL',    label: 'All',         dot: 'bg-gray-400'   },
  { key: 'RED',    label: 'Danger',      dot: 'bg-red-500'    },
  { key: 'YELLOW', label: 'Attention',   dot: 'bg-yellow-400' },
  { key: 'GREEN',  label: 'Standard',    dot: 'bg-green-500'  },
  { key: 'BLUE',   label: 'Your rights', dot: 'bg-blue-500'   },
  { key: 'GREY',   label: 'Boilerplate', dot: 'bg-gray-300'   },
];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── Risk ring visual ─────────────────────────────────────────────────────────

function RiskRing({ risk }) {
  const cfg    = RISK_CONFIG[risk] || RISK_CONFIG.LOW;
  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const pct    = risk === 'HIGH' ? 0.85 : risk === 'MEDIUM' ? 0.5 : 0.2;
  const dash   = pct * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle cx="36" cy="36" r={radius} fill="none" stroke={cfg.color}
            strokeWidth="6" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">{cfg.icon}</span>
        </div>
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${cfg.badgeBg} ${cfg.textColor} ${cfg.badgeBorder}`}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Clause count stats ───────────────────────────────────────────────────────

function ClauseStats({ counts }) {
  const stats = [
    { key: 'RED',    label: 'Danger',      color: 'bg-red-500',    text: 'text-red-700'    },
    { key: 'YELLOW', label: 'Attention',   color: 'bg-yellow-400', text: 'text-yellow-700' },
    { key: 'BLUE',   label: 'Your rights', color: 'bg-blue-500',   text: 'text-blue-700'   },
    { key: 'GREEN',  label: 'Standard',    color: 'bg-green-500',  text: 'text-green-700'  },
    { key: 'GREY',   label: 'Boilerplate', color: 'bg-gray-300',   text: 'text-gray-500'   },
  ];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {stats.map(({ key, label, color, text }) => {
        const n = counts[key] || 0;
        if (n === 0) return null;
        return (
          <div key={key} className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1">
            <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
            <span className={`text-xs font-semibold ${text}`}>{n}</span>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        );
      })}
      <span className="text-xs text-gray-400 ml-1">{total} total</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Analysis() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [analysis,   setAnalysis]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('ALL');
  const [lang,       setLang]       = useState('en');
  const [question,   setQuestion]   = useState('');
  const [answer,     setAnswer]     = useState('');
  const [asking,     setAsking]     = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const [shareUrl,   setShareUrl]   = useState('');
  const [sharing,    setSharing]    = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [rerunLang,  setRerunLang]  = useState('');
  const [rerunning,  setRerunning]  = useState(false);
  const [rerunError, setRerunError] = useState('');

  useEffect(() => {
    if (id === 'new') {
      const cached   = sessionStorage.getItem('klaro_analysis');
      const storedId = sessionStorage.getItem('klaro_analysis_id');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setAnalysis(parsed);
          if (storedId) setAnalysisId(storedId);
          if (parsed.language) setLang(parsed.language);
          if (parsed.shareToken) setShareUrl(`${window.location.origin}/shared/${parsed.shareToken}`);
          setLoading(false);
          return;
        } catch {}
      }
      navigate('/upload');
      return;
    }
    api.analyze.getById(id)
      .then((data) => {
        setAnalysis(data.analysis);
        setAnalysisId(id);
        setLang(data.analysis.language || 'en');
        if (data.analysis.shareToken) setShareUrl(`${window.location.origin}/shared/${data.analysis.shareToken}`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim() || !analysisId) return;
    setAsking(true); setAnswer('');
    try {
      const data = await api.ask(analysisId, question, lang);
      setAnswer(data.answer);
    } catch { setAnswer('Sorry, could not get an answer. Please try again.'); }
    finally { setAsking(false); }
  }

  async function handleShare() {
    if (shareUrl) { copyUrl(shareUrl); return; }
    if (!analysisId) return;
    setSharing(true);
    try {
      const data = await api.analyze.share(analysisId);
      const url  = `${window.location.origin}/shared/${data.shareToken}`;
      setShareUrl(url);
      copyUrl(url);
    } catch {} finally { setSharing(false); }
  }

  function copyUrl(url) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
        .catch(() => fallbackCopy(url));
    } else { fallbackCopy(url); }
  }

  function fallbackCopy(url) {
    const el = document.createElement('textarea');
    el.value = url; el.style.position = 'fixed'; el.style.opacity = '0';
    document.body.appendChild(el); el.select();
    try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { alert(`Copy this link:\n${url}`); }
    document.body.removeChild(el);
  }

  async function handleRerun(targetLang) {
    if (!targetLang || !analysis) return;
    const currentLang = analysis.language || lang;
    if (targetLang === currentLang) return;
    setRerunLang(targetLang); setRerunning(true); setRerunError('');
    try {
      const text = (analysis.clauses || []).map(c => c.originalText).filter(Boolean).join('\n\n');
      if (!text || text.trim().length < 30) {
        setRerunError('Original text unavailable. Please upload the document again.');
        return;
      }
      const data = await api.analyze.create({ text, filename: analysis.filename, language: targetLang });
      sessionStorage.setItem('klaro_analysis', JSON.stringify({ ...data.analysis, language: targetLang }));
      sessionStorage.setItem('klaro_analysis_id', data.id);
      window.location.href = '/analysis/new';
    } catch (e) { setRerunError(e.message || 'Could not re-analyse. Please try again.'); }
    finally { setRerunning(false); setRerunLang(''); }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-6 animate-pulse" />
          <div className="flex gap-6">
            <div className="w-72 flex-shrink-0 space-y-4 animate-pulse">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
            <div className="flex-1 space-y-3 animate-pulse">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-5">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-center max-w-sm w-full py-12 px-8">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="font-bold text-gray-900 dark:text-white mb-2">Could not load analysis</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/dashboard" className="btn-primary text-sm">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const clauses    = analysis.clauses || [];
  const counts     = clauses.reduce((acc, c) => { acc[c.rating] = (acc[c.rating] || 0) + 1; return acc; }, {});
  const redClauses = counts.RED || 0;
  const filtered   = filter === 'ALL' ? clauses : clauses.filter(c => c.rating === filter);
  const daysLeft   = daysUntil(analysis.expiresAt);
  const expiring   = daysLeft !== null && daysLeft <= 7;
  const riskCfg    = RISK_CONFIG[analysis.overallRisk] || RISK_CONFIG.LOW;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white; }
          .analysis-sidebar { display: none !important; }
        }
      `}</style>

      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />

      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[57px] z-10 no-print">
        <div className="max-w-5xl mx-auto px-5 py-2.5 flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>

          <div className="flex items-center gap-2">
            {expiring && (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2.5 py-1 rounded-full">
                Expires in {daysLeft}d
              </span>
            )}
            <button onClick={handleShare} disabled={sharing}
              className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {copied
                ? <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Copied</>
                : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>Share</>
              }
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto px-5 py-6 flex gap-6 items-start">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside className="analysis-sidebar w-72 flex-shrink-0 sticky top-[105px] space-y-4 hidden md:block">

          {/* Risk overview card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div className="flex flex-col items-center text-center mb-5">
              <RiskRing risk={analysis.overallRisk} />
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{analysis.documentType}</p>
              {analysis.filename && (
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{analysis.filename}</p>
              )}
              {analysis.createdAt && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(analysis.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Clause breakdown */}
            <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
              {[
                { key: 'RED',    label: 'Dangerous',   color: 'bg-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-700 dark:text-red-400'   },
                { key: 'YELLOW', label: 'Attention',   color: 'bg-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
                { key: 'BLUE',   label: 'Your rights', color: 'bg-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',  text: 'text-blue-700 dark:text-blue-400' },
                { key: 'GREEN',  label: 'Standard',    color: 'bg-green-500',  bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
                { key: 'GREY',   label: 'Boilerplate', color: 'bg-gray-300',   bg: 'bg-gray-50 dark:bg-gray-700/30',  text: 'text-gray-500 dark:text-gray-400' },
              ].map(({ key, label, color, bg, text }) => {
                const n = counts[key] || 0;
                if (n === 0) return null;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(filter === key ? 'ALL' : key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${filter === key ? bg : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className={`text-xs font-medium ${text}`}>{label}</span>
                    </div>
                    <span className={`text-xs font-bold ${text}`}>{n}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language switcher */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 no-print">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Translate analysis</p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(LANG_LABELS).map(([code, label]) => {
                const isCurrent = code === (analysis.language || lang);
                const isLoading = rerunning && rerunLang === code;
                return (
                  <button
                    key={code}
                    disabled={isCurrent || rerunning}
                    onClick={() => handleRerun(code)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors text-left ${
                      isCurrent
                        ? 'bg-brand-600 text-white border-brand-600 cursor-default'
                        : rerunning
                        ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                    }`}
                  >
                    {isLoading ? '⏳...' : isCurrent ? `✓ ${label}` : label}
                  </button>
                );
              })}
            </div>
            {rerunError && <p className="text-xs text-red-500 mt-2">{rerunError}</p>}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">Re-analysis takes a few seconds.</p>
          </div>

          {/* Ask Klaro */}
          {analysisId && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 no-print">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Ask Klaro</p>
              </div>
              <form onSubmit={handleAsk} className="space-y-2">
                <textarea
                  className="input text-xs min-h-[72px] resize-none w-full"
                  placeholder='e.g. "What happens if I leave after 6 months?"'
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                />
                <button type="submit" disabled={asking || !question.trim()} className="btn-primary w-full text-xs py-2">
                  {asking
                    ? <span className="flex items-center justify-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Thinking...</span>
                    : 'Ask question'
                  }
                </button>
              </form>
              {answer && (
                <div className="mt-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Klaro explains. Not legal advice.</p>
            </div>
          )}
        </aside>

        {/* ── Right: clauses ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Mobile-only: risk header */}
          <div className="md:hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <RiskRing risk={analysis.overallRisk} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{analysis.documentType}</p>
                {analysis.filename && <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{analysis.filename}</p>}
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Summary</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>

            {analysis.topThreeWarnings?.length > 0 && (
              <div className="mt-4 space-y-2.5">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Top things to know</p>
                {analysis.topThreeWarnings.map((w, i) => (
                  <div key={i} className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-3.5 py-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger alert */}
          {redClauses > 0 && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3.5">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">{redClauses} dangerous clause{redClauses !== 1 ? 's' : ''} found</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Review all RED clauses carefully before signing this document.</p>
              </div>
            </div>
          )}

          {/* Filter + clause count */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
              {CLAUSE_FILTERS.map(({ key, label, dot }) => {
                const count = key === 'ALL' ? clauses.length : (counts[key] || 0);
                if (key !== 'ALL' && count === 0) return null;
                return (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border transition-colors flex-shrink-0 ${
                      filter === key
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    {label}
                    <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clause list */}
          <div className="space-y-2">
            {filtered.map(clause => <ClauseCard key={clause.id} clause={clause} lang={lang} />)}
            {filtered.length === 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-12 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No clauses match this filter.</p>
              </div>
            )}
          </div>

          {/* Mobile-only: ask Klaro */}
          {analysisId && (
            <div className="md:hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 no-print">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">Ask Klaro about this document</p>
              </div>
              <form onSubmit={handleAsk} className="space-y-3">
                <textarea className="input min-h-[80px] resize-none text-sm w-full"
                  placeholder='e.g. "What happens if I leave the job after 6 months?"'
                  value={question} onChange={e => setQuestion(e.target.value)} />
                <button type="submit" disabled={asking || !question.trim()} className="btn-primary w-full text-sm">
                  {asking ? 'Getting answer...' : 'Ask Klaro'}
                </button>
              </form>
              {answer && (
                <div className="mt-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </div>
              )}
            </div>
          )}

          {/* Mobile-only: language switcher */}
          <div className="md:hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 no-print">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Translate analysis</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LANG_LABELS).map(([code, label]) => {
                const isCurrent = code === (analysis.language || lang);
                const isLoading = rerunning && rerunLang === code;
                return (
                  <button key={code} disabled={isCurrent || rerunning} onClick={() => handleRerun(code)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      isCurrent ? 'bg-brand-600 text-white border-brand-600 cursor-default'
                      : rerunning ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-600'
                    }`}>
                    {isLoading ? '⏳...' : isCurrent ? `✓ ${label}` : label}
                  </button>
                );
              })}
            </div>
            {rerunError && <p className="text-xs text-red-500 mt-2">{rerunError}</p>}
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 px-4 leading-relaxed">
            This is an explanation of the document, not legal advice. Consult a qualified Ghana lawyer before making any decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
