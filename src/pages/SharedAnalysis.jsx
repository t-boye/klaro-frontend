import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import RiskBadge from '../components/RiskBadge';
import ClauseCard from '../components/ClauseCard';
import FilterBar from '../components/FilterBar';

export default function SharedAnalysis() {
  const { token } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('ALL');

  useEffect(() => {
    api.shared(token)
      .then((d) => setAnalysis(d.analysis))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-5">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="card space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-5">
        <div className="card text-center max-w-sm w-full py-10">
          <p className="text-3xl mb-3">🔒</p>
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Analysis unavailable</p>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <Link to="/" className="btn-primary text-sm">Go to Klaro</Link>
        </div>
      </div>
    );
  }

  const clauses  = analysis.clauses || [];
  const filtered = filter === 'ALL' ? clauses : clauses.filter((c) => c.rating === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Shared banner */}
      <div className="bg-brand-600 text-white text-center text-sm py-2.5 px-4">
        This analysis was shared via Klaro.{' '}
        <Link to="/auth" className="underline font-semibold">Create your free account</Link> to analyse your own documents.
      </div>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/"><img src="/assets/logos/logo.png" alt="Klaro" className="h-10 object-contain" /></Link>
          <span className="text-xs text-gray-400">Shared document analysis</span>
        </div>

        <div className="card mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{analysis.documentType}</p>
          <RiskBadge risk={analysis.overallRisk} large />
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
        </div>

        <FilterBar active={filter} onChange={setFilter} counts={clauses.reduce((acc, c) => {
          acc[c.rating] = (acc[c.rating] || 0) + 1; return acc;
        }, {})} />

        <div className="mt-4 space-y-3">
          {filtered.map((clause) => <ClauseCard key={clause.id} clause={clause} lang={analysis.language || 'en'} />)}
        </div>

        <div className="mt-10 bg-brand-50 border border-brand-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-brand-800 mb-1">Have a document you need explained?</p>
          <p className="text-sm text-brand-700 mb-4">Get 3 free analyses — no credit card needed.</p>
          <Link to="/auth" className="btn-primary">Start for free</Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Klaro explains documents. It does not give legal advice.
        </p>
      </main>
    </div>
  );
}
