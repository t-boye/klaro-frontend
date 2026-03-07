import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearSession } from '../lib/auth';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import ClauseCard from '../components/ClauseCard';
import FilterBar from '../components/FilterBar';
import LanguageToggle from '../components/LanguageToggle';

const LANG_LABELS = { en:'English', tw:'Twi', ga:'Ga', ewe:'Ewe', dag:'Dagbani', ha:'Hausa', fan:'Fante' };

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis,    setAnalysis]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [filter,      setFilter]      = useState('ALL');
  const [lang,        setLang]        = useState('en');
  const [question,    setQuestion]    = useState('');
  const [answer,      setAnswer]      = useState('');
  const [asking,      setAsking]      = useState(false);
  const [analysisId,  setAnalysisId]  = useState(null);
  const [shareUrl,    setShareUrl]    = useState('');
  const [sharing,     setSharing]     = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [rerunLang,   setRerunLang]   = useState('');
  const [rerunning,   setRerunning]   = useState(false);

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
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function handlePrint() {
    window.print();
  }

  async function handleRerun() {
    if (!rerunLang || rerunLang === lang || !analysis) return;
    setRerunning(true);
    try {
      const text = analysis.clauses?.map(c => c.text).join('\n\n') || analysis.summary || '';
      const data = await api.analyze.create({ text, filename: analysis.filename, language: rerunLang });
      sessionStorage.setItem('klaro_analysis', JSON.stringify({ ...data.analysis, language: rerunLang }));
      sessionStorage.setItem('klaro_analysis_id', data.id);
      navigate('/analysis/new');
      window.location.reload();
    } catch (e) { alert(e.message); }
    finally { setRerunning(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="card space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          {[1,2,3].map((i) => <div key={i} className="card space-y-2"><div className="h-4 bg-gray-200 rounded w-1/3" /><div className="h-3 bg-gray-200 rounded w-full" /></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-5">
        <div className="card text-center max-w-sm w-full py-10">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="font-semibold text-gray-900 mb-1">Could not load analysis</p>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <a href="/dashboard" className="btn-primary text-sm">Back to dashboard</a>
        </div>
      </div>
    );
  }
  if (!analysis) return null;

  const clauses    = analysis.clauses || [];
  const redClauses = clauses.filter((c) => c.rating === 'RED');
  const filtered   = filter === 'ALL' ? clauses : clauses.filter((c) => c.rating === filter);
  const daysLeft   = daysUntil(analysis.expiresAt);
  const expiringSoon = daysLeft !== null && daysLeft <= 7;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Print styles */}
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white; }
          .card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <Link to="/dashboard" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">&larr; Dashboard</Link>
          <div className="flex gap-2 no-print">
            <button onClick={handleShare} disabled={sharing}
              className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5">
              {sharing ? '...' : copied ? '✓ Copied!' : '🔗 Share'}
            </button>
            <button onClick={handlePrint}
              className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5">
              🖨 Export PDF
            </button>
          </div>
        </div>

        {/* Expiry warning */}
        {expiringSoon && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 no-print">
            <p className="text-sm text-yellow-800 font-medium">
              ⏰ This analysis expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Export it now to keep a copy.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="card mb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{analysis.documentType}</p>
              <RiskBadge risk={analysis.overallRisk} large />
            </div>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>

          <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">{analysis.summary}</p>

          {analysis.topThreeWarnings?.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top things to know:</p>
              {analysis.topThreeWarnings.map((w, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-yellow-500 mt-0.5">⚠</span><span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Re-run in different language */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 no-print">
            <p className="text-xs text-gray-400 mb-2">Re-analyse in a different language:</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(LANG_LABELS).filter(([code]) => code !== lang).map(([code, label]) => (
                <button key={code}
                  onClick={() => { setRerunLang(code); }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${rerunLang === code ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-brand-300'}`}>
                  {label}
                </button>
              ))}
              {rerunLang && rerunLang !== lang && (
                <button onClick={handleRerun} disabled={rerunning}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors">
                  {rerunning ? 'Analysing...' : `Analyse in ${LANG_LABELS[rerunLang]}`}
                </button>
              )}
            </div>
          </div>
        </div>

        {redClauses.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm font-semibold text-red-700">{redClauses.length} dangerous clause{redClauses.length !== 1 ? 's' : ''} found</p>
            <p className="text-xs text-red-600 mt-0.5">Scroll down to review the RED clauses before signing.</p>
          </div>
        )}

        <FilterBar active={filter} onChange={setFilter} counts={clauses.reduce((acc, c) => { acc[c.rating] = (acc[c.rating] || 0) + 1; return acc; }, {})} />

        <div className="mt-4 space-y-3">
          {filtered.map((clause) => <ClauseCard key={clause.id} clause={clause} lang={lang} />)}
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No clauses match this filter.</p>}
        </div>

        {analysisId && (
          <div className="card mt-6 no-print">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ask Klaro about this document</h3>
            <form onSubmit={handleAsk} className="space-y-3">
              <textarea className="input min-h-[80px] resize-none text-sm"
                placeholder='e.g. "What happens if I leave the job after 6 months?"'
                value={question} onChange={(e) => setQuestion(e.target.value)} />
              <button type="submit" className="btn-primary w-full text-sm" disabled={asking || !question.trim()}>
                {asking ? 'Getting answer...' : 'Ask Klaro'}
              </button>
            </form>
            {answer && (
              <div className="mt-4 bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</div>
            )}
            <p className="text-xs text-gray-400 mt-3">Klaro explains — it does not give legal advice.</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8 px-4">
          This is an explanation of the document, not legal advice. For advice on what to do, consult a qualified Ghana lawyer.
        </p>
      </main>
    </div>
  );
}
