import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearSession, getUser, getToken, setSession } from '../lib/auth';
import RiskBadge from '../components/RiskBadge';
import Navbar from '../components/Navbar';
import UpgradeModal from '../components/UpgradeModal';
import { useLang } from '../context/LangContext';

const PAGE_SIZE = 10;

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
}

function monthGroup(dateStr, t) {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (diff === 0) return t('dashboard.thisMonth');
  if (diff === 1) return t('dashboard.lastMonth');
  return d.toLocaleDateString('en-GH', { month: 'long', year: 'numeric' });
}

function groupByMonth(analyses, t) {
  const groups = [];
  let current  = null;
  for (const a of analyses) {
    const label = monthGroup(a.created_at, t);
    if (!current || current.label !== label) {
      current = { label, items: [] };
      groups.push(current);
    }
    current.items.push(a);
  }
  return groups;
}

// ─── Plan banner ────────────────────────────────────────────────────────────

function PlanBanner({ license, onUpgrade }) {
  if (!license) return null;
  const { plan, usage } = license;

  if (plan === 'trial') {
    const remaining = 3 - (usage.trialAnalysesUsed || 0);
    return (
      <div className="flex items-center justify-between gap-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl px-4 py-3 mb-6">
        <div>
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">
            Free trial: {remaining} analysis{remaining !== 1 ? 'es' : ''} remaining
          </p>
          <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
            <Link to="/upload" className="underline">Analyse a document</Link> or{' '}
            <button onClick={onUpgrade} className="underline">choose a plan</button> for more.
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-1">
          {[0,1,2].map((i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < (3 - remaining) ? 'bg-brand-600' : 'bg-brand-200 dark:bg-brand-700'}`} />
          ))}
        </div>
      </div>
    );
  }
  if (plan === 'individual') {
    const used      = usage.documentsThisMonth || 0;
    const remaining = Math.max(0, 5 - used);
    return (
      <div className="flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-3 mb-6">
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Individual plan: {remaining} document{remaining !== 1 ? 's' : ''} left this month
          </p>
          {remaining === 0 && (
            <button onClick={onUpgrade} className="text-xs text-blue-700 dark:text-blue-400 underline mt-0.5">Upgrade for unlimited</button>
          )}
        </div>
        <div className="flex-shrink-0 flex gap-1">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < used ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-700'}`} />
          ))}
        </div>
      </div>
    );
  }
  if (plan === 'pay_per_doc') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 mb-6">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pay-per-document plan</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Each analysis requires a payment.{' '}
          <button onClick={onUpgrade} className="underline text-brand-600 dark:text-brand-400">Switch to monthly</button>
        </p>
      </div>
    );
  }
  if (plan === 'professional' || plan === 'business') {
    return (
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-green-800 dark:text-green-300 capitalize">
          {plan} plan: unlimited analyses
        </p>
      </div>
    );
  }
  return null;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
      <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
    </div>
  );
}

// ─── Analysis card ───────────────────────────────────────────────────────────

function AnalysisCard({ a, renaming, renameVal, setRenameVal, onStartRename, onSubmitRename, onCancelRename, onDelete, deleting }) {
  const days      = daysUntil(a.expires_at);
  const expiring  = days !== null && days <= 7;
  const isRenaming = renaming === a.id;

  return (
    <div className="group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors rounded-xl relative">
      {/* Risk colour strip */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
        a.overall_risk === 'HIGH'   ? 'bg-red-400' :
        a.overall_risk === 'MEDIUM' ? 'bg-yellow-400' :
        'bg-green-400'
      }`} />

      {/* Main content - links to analysis */}
      <Link to={`/analysis/${a.id}`} className="flex-1 min-w-0 block">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate leading-tight">
          {a.document_type || 'Legal Document'}
        </p>

        {/* Rename input or filename */}
        {isRenaming ? (
          <form
            onSubmit={(e) => onSubmitRename(e, a.id)}
            className="flex items-center gap-1.5 mt-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="input text-xs py-1 px-2 flex-1 min-w-0 h-7"
              maxLength={200}
              placeholder="Enter new name..."
            />
            <button
              type="submit"
              onClick={(e) => onSubmitRename(e, a.id)}
              className="text-xs px-2.5 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 h-7 flex-shrink-0"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelRename}
              className="text-xs px-2.5 py-1 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 h-7 flex-shrink-0"
            >
              Cancel
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {a.original_filename || 'Unnamed document'}
          </p>
        )}

        {/* Meta row */}
        {!isRenaming && (
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(a.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {days !== null && (
              <span className={`text-xs font-medium ${expiring ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}>
                {expiring ? `Expires in ${days}d` : `Exp. ${new Date(a.expires_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}`}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Right: badge + actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <RiskBadge risk={a.overall_risk} />
        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            onClick={(e) => onStartRename(e, a.id, a.original_filename)}
            title="Rename"
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => onDelete(e, a.id)}
            disabled={deleting === a.id}
            title="Delete"
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {deleting === a.id
              ? <span className="text-xs w-3.5 inline-block text-center">...</span>
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const user     = getUser();
  const { t }    = useLang();

  const [analyses,     setAnalyses]     = useState([]);
  const [license,      setLicense]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [loadError,    setLoadError]    = useState('');
  const [showUpgrade,  setShowUpgrade]  = useState(false);
  const [deleting,     setDeleting]     = useState(null);
  const [renaming,     setRenaming]     = useState(null);
  const [renameVal,    setRenameVal]    = useState('');
  const [search,       setSearch]       = useState('');
  const [riskFilter,   setRiskFilter]   = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [hasMore,      setHasMore]      = useState(false);

  // Stable ref to current filters so loadMore can access them
  const filtersRef = useRef({ search: '', risk: '' });

  const loadPage = useCallback(async (q, risk, p, append = false) => {
    filtersRef.current = { search: q, risk };
    if (append) setLoadingMore(true); else setLoading(true);
    setLoadError('');
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (q)    params.search = q;
      if (risk) params.risk   = risk;

      const [aData, lData] = await Promise.all([
        api.analyze.list(params),
        p === 1 ? api.license() : Promise.resolve(null),
      ]);

      const incoming = aData.analyses || [];
      const pg       = aData.pagination || {};

      setTotal(pg.total ?? 0);
      setHasMore((pg.page ?? p) < (pg.totalPages ?? 1));
      setPage(pg.page ?? p);

      setAnalyses((prev) => append ? [...prev, ...incoming] : incoming);

      if (lData) {
        setLicense(lData);
        const currentUser = getUser();
        if (currentUser && lData.plan && currentUser.plan !== lData.plan) {
          setSession(getToken(), { ...currentUser, plan: lData.plan });
        }
      }
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPage('', '', 1, false); }, [loadPage]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    loadPage(searchInput, riskFilter, 1, false);
  }

  function handleRiskFilter(risk) {
    setRiskFilter(risk);
    setPage(1);
    loadPage(search, risk, 1, false);
  }

  function handleClearSearch() {
    setSearchInput('');
    setSearch('');
    setRiskFilter('');
    setPage(1);
    loadPage('', '', 1, false);
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    loadPage(filtersRef.current.search, filtersRef.current.risk, nextPage, true);
  }

  async function handleDelete(e, id) {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.analyze.remove(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) { alert(err.message || 'Could not delete.'); }
    finally { setDeleting(null); }
  }

  function startRename(e, id, currentName) {
    e.preventDefault(); e.stopPropagation();
    setRenaming(id);
    setRenameVal(currentName || '');
  }

  async function submitRename(e, id) {
    e.preventDefault(); e.stopPropagation();
    if (!renameVal.trim()) return;
    try {
      await api.analyze.rename(id, renameVal.trim());
      setAnalyses((prev) => prev.map((a) => a.id === id ? { ...a, original_filename: renameVal.trim() } : a));
    } catch (err) { alert(err.message || 'Could not rename.'); }
    finally { setRenaming(null); setRenameVal(''); }
  }

  function cancelRename(e) {
    e.preventDefault(); e.stopPropagation();
    setRenaming(null); setRenameVal('');
  }

  const groups       = groupByMonth(analyses, t);
  const isFiltered   = !!(search || riskFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.full_name ? `${t('dashboard.hi')}, ${user.full_name.split(' ')[0]}` : t('nav.dashboard')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.yourDocs')}</p>
          </div>
          <Link to="/upload" className="btn-primary text-sm gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t('dashboard.analyseBtn')}
          </Link>
        </div>

        <PlanBanner license={license} onUpgrade={() => setShowUpgrade(true)} />
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

        {/* Quick-action row: country prompt + legal chat side by side */}
        <div className="flex gap-3 mb-5">
          {/* Country prompt — only shown when country not set */}
          {!user?.country && (
            <Link to="/profile" className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-3 py-3 hover:border-amber-300 transition-colors flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">🌍</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-tight truncate">{t('dashboard.countryPromptTitle')}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 leading-tight line-clamp-2">{t('dashboard.countryPromptSub')}</p>
              </div>
            </Link>
          )}

          {/* Legal Chat card */}
          <Link to="/chat" className={`flex items-center gap-3 bg-gradient-to-r from-[#1B4332] to-[#2d6a4f] text-white rounded-2xl px-3 py-3 hover:from-[#163829] hover:to-[#255a43] transition-all group flex-1 min-w-0 ${user?.country ? 'w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-[#52B788]/25 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-white leading-tight">{t('dashboard.chatTitle')}</p>
              <p className="text-[#52B788]/80 text-xs mt-0.5 leading-tight line-clamp-2">{t('dashboard.chatSub')}</p>
            </div>
            <svg className="w-3.5 h-3.5 text-[#52B788]/60 group-hover:text-[#52B788] group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 mb-5 space-y-2.5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="input pl-9 text-sm w-full"
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary text-sm px-4">{t('dashboard.search')}</button>
            {isFiltered && (
              <button type="button" onClick={handleClearSearch} className="text-sm px-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {t('dashboard.clear')}
              </button>
            )}
          </form>

          {/* Risk filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: t('dashboard.filterAll'),    val: '',       dot: null },
              { label: t('dashboard.filterHigh'),   val: 'HIGH',   dot: 'bg-red-400' },
              { label: t('dashboard.filterMedium'), val: 'MEDIUM', dot: 'bg-yellow-400' },
              { label: t('dashboard.filterLow'),    val: 'LOW',    dot: 'bg-green-400' },
            ].map(({ label, val, dot }) => (
              <button
                key={val}
                onClick={() => handleRiskFilter(val)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  riskFilter === val
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-brand-300 bg-white dark:bg-gray-800'
                }`}
              >
                {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && total > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 px-1">
            {t('dashboard.showing')} {analyses.length} {t('dashboard.of')} {total} {total !== 1 ? t('dashboard.documents') : t('dashboard.document')}
            {isFiltered && ` ${t('dashboard.filtered')}`}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            {[1,2,3,4,5].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : loadError ? (
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-10 text-center">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.couldNotLoad')}</p>
            <p className="text-xs text-gray-400 mb-4">{loadError}</p>
            <button onClick={() => loadPage('', '', 1)} className="btn-primary text-sm">{t('dashboard.tryAgain')}</button>
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-16 text-center">
            <p className="text-5xl mb-4">📄</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {isFiltered ? t('dashboard.noResults') : t('dashboard.noDocsTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {isFiltered ? t('dashboard.noResultsSub') : t('dashboard.noDocsSub')}
            </p>
            {isFiltered
              ? <button onClick={handleClearSearch} className="btn-primary text-sm">{t('dashboard.clearFilter')}</button>
              : <Link to="/upload" className="btn-primary text-sm">{t('dashboard.analyseFirst')}</Link>
            }
          </div>
        ) : (
          <>
            {/* Grouped list */}
            <div className="space-y-5">
              {groups.map((group) => (
                <div key={group.label}>
                  {/* Month heading */}
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      {group.label}
                    </p>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs text-gray-300 dark:text-gray-600 flex-shrink-0">
                      {group.items.length} doc{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/60">
                    {group.items.map((a) => (
                      <AnalysisCard
                        key={a.id}
                        a={a}
                        renaming={renaming}
                        renameVal={renameVal}
                        setRenameVal={setRenameVal}
                        onStartRename={startRename}
                        onSubmitRename={submitRename}
                        onCancelRename={cancelRename}
                        onDelete={handleDelete}
                        deleting={deleting}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-5">
                {loadingMore ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {[1,2,3].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-brand-300 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {t('dashboard.loadMore')} ({total - analyses.length} {t('dashboard.remaining')})
                  </button>
                )}
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && analyses.length > PAGE_SIZE && (
              <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-5 py-2">
                {t('dashboard.allShown').replace('{n}', total)}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
