import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearSession } from '../lib/auth';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import ClauseCard from '../components/ClauseCard';
import FilterBar from '../components/FilterBar';
import LanguageToggle from '../components/LanguageToggle';

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState('ALL');
  const [lang, setLang]             = useState('en');
  const [question, setQuestion]     = useState('');
  const [answer, setAnswer]         = useState('');
  const [asking, setAsking]         = useState(false);
  const [analysisId, setAnalysisId] = useState(null);

  useEffect(() => {
    // Fresh analysis comes from sessionStorage (id === 'new')
    if (id === 'new') {
      const cached   = sessionStorage.getItem('klaro_analysis');
      const storedId = sessionStorage.getItem('klaro_analysis_id');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setAnalysis(parsed);
          if (storedId) setAnalysisId(storedId);
          if (parsed.language) setLang(parsed.language);
          setLoading(false);
          return;
        } catch {}
      }
      navigate('/upload');
      return;
    }

    // Load from API
    api.analyze.getById(id)
      .then((data) => {
        setAnalysis(data.analysis);
        setAnalysisId(id);
        setLang(data.analysis.language || 'en');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim() || !analysisId) return;
    setAsking(true);
    setAnswer('');
    try {
      const data = await api.ask(analysisId, question, lang);
      setAnswer(data.answer);
    } catch (err) {
      setAnswer('Sorry, could not get an answer. Please try again.');
    } finally {
      setAsking(false);
    }
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
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-4">
          <Link to="/dashboard" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">&larr; Dashboard</Link>
        </div>

        {/* Header */}
        <div className="card mb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{analysis.documentType}</p>
              <RiskBadge risk={analysis.overallRisk} large />
            </div>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>

          {/* Summary */}
          <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">{analysis.summary}</p>

          {/* Top warnings */}
          {analysis.topThreeWarnings?.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top things to know:</p>
              {analysis.topThreeWarnings.map((w, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500 mt-0.5">⚠</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Red flag banner */}
        {redClauses.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm font-semibold text-red-700">
              {redClauses.length} dangerous clause{redClauses.length !== 1 ? 's' : ''} found
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Scroll down to review the RED clauses before signing.
            </p>
          </div>
        )}

        {/* Filter */}
        <FilterBar active={filter} onChange={setFilter} counts={clauses.reduce((acc, c) => {
          acc[c.rating] = (acc[c.rating] || 0) + 1;
          return acc;
        }, {})} />

        {/* Clauses */}
        <div className="mt-4 space-y-3">
          {filtered.map((clause) => (
            <ClauseCard key={clause.id} clause={clause} lang={lang} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No clauses match this filter.</p>
          )}
        </div>

        {/* Ask Klaro */}
        {analysisId && (
          <div className="card mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ask Klaro about this document</h3>
            <form onSubmit={handleAsk} className="space-y-3">
              <textarea
                className="input min-h-[80px] resize-none text-sm"
                placeholder='e.g. "What happens if I leave the job after 6 months?"'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button type="submit" className="btn-primary w-full text-sm" disabled={asking || !question.trim()}>
                {asking ? 'Getting answer...' : 'Ask Klaro'}
              </button>
            </form>
            {answer && (
              <div className="mt-4 bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {answer}
              </div>
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
