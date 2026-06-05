import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/adminApi';
import { clearAdminSession, getAdmin } from '../lib/adminAuth';
import Spinner from '../components/Spinner';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n)      { return (n ?? 0).toLocaleString(); }
function fmtGhs(n)   { return `GH₵ ${Number(n ?? 0).toFixed(2)}`; }
function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PLAN_COLORS = {
  trial:        'bg-gray-100 text-gray-600',
  pay_per_doc:  'bg-orange-100 text-orange-700',
  individual:   'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  business:     'bg-emerald-100 text-emerald-700',
};

const EVENT_COLORS = {
  'user.register':    'text-blue-600',
  'user.login':       'text-green-600',
  'analysis.create':  'text-indigo-600',
  'payment.success':  'text-emerald-600',
  'admin.login':      'text-orange-600',
  'admin.plan_change':'text-purple-600',
};

const ALL_PLANS = ['trial', 'pay_per_doc', 'individual', 'professional', 'business'];

const EVENT_TYPES = [
  '', 'user.register', 'user.login', 'analysis.create',
  'payment.success', 'admin.login', 'admin.plan_change',
];

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'bg-white' }) {
  return (
    <div className={`${color} rounded-xl p-5 border border-gray-100 shadow-sm`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function PlanBadge({ plan }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[plan] || 'bg-gray-100 text-gray-600'}`}>
      {plan}
    </span>
  );
}

function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
      <span>Page {page} of {totalPages} ({fmt(total)} total)</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
      </div>
    </div>
  );
}

// ─── tabs ─────────────────────────────────────────────────────────────────────

const RISK_BAR_COLORS = { HIGH: 'bg-red-500', MEDIUM: 'bg-yellow-400', LOW: 'bg-green-500' };
const LANG_LABELS = { en: 'English', tw: 'Twi', ga: 'Ga', ewe: 'Ewe', dag: 'Dagbani', ha: 'Hausa', fan: 'Fante' };

function BarRow({ label, count, max, color = 'bg-brand-500' }) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 4;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-600 w-36 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-500 font-medium w-8 text-right flex-shrink-0">{count}</span>
    </div>
  );
}

function OverviewTab({ stats, onTabChange }) {
  if (!stats) return <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-brand-600" /></div>;

  const avgSec = stats.analyses.avgProcessingMs > 0 ? (stats.analyses.avgProcessingMs / 1000).toFixed(1) : '—';
  const maxDoc = Math.max(...(stats.topDocumentTypes.map(d => d.count)), 1);
  const maxLang = Math.max(...(stats.languageDistribution?.map(l => l.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Pending applications alert */}
      {stats.pendingApplications > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-amber-800">{stats.pendingApplications} pending lawyer application{stats.pendingApplications !== 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-600">Lawyers waiting for review and approval</p>
            </div>
          </div>
          <button onClick={() => onTabChange('Applications')} className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0">
            Review →
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total users"     value={fmt(stats.users.total)}           sub={`+${fmt(stats.users.last30d)} last 30d`} />
        <StatCard label="Total analyses"  value={fmt(stats.analyses.total)}         sub={`+${fmt(stats.analyses.last30d)} last 30d`} />
        <StatCard label="Total revenue"   value={fmtGhs(stats.revenue.totalGhs)}   sub={`${fmtGhs(stats.revenue.last30dGhs)} last 30d`} color="bg-emerald-50" />
        <StatCard label="Avg. analysis"   value={`${avgSec}s`}                      sub={`${fmt(stats.analyses.totalTokens)} tokens total`} />
      </div>

      {/* Daily activity bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Daily analyses, last 14 days</h3>
        {stats.dailyActivity.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="flex items-end gap-1.5 h-28">
            {stats.dailyActivity.map((d) => {
              const max = Math.max(...stats.dailyActivity.map((x) => x.count), 1);
              const pct = Math.round((d.count / max) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.day}: ${d.count} analyses`}>
                  <span className="text-xs text-gray-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                  <div className="w-full bg-brand-500 rounded-t hover:bg-brand-400 transition-colors" style={{ height: `${Math.max(pct, 3)}%` }} />
                  <span className="text-gray-400 hidden sm:block" style={{ fontSize: 9 }}>
                    {new Date(d.day).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Plan distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Plan distribution</h3>
          <div className="space-y-2">
            {stats.planDistribution.map((p) => (
              <div key={p.plan} className="flex items-center justify-between text-sm">
                <PlanBadge plan={p.plan} />
                <span className="font-medium text-gray-600">{fmt(p.count)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Risk distribution</h3>
          <div className="space-y-3">
            {stats.riskDistribution.map((r) => (
              <div key={r.overall_risk} className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${RISK_COLORS[r.overall_risk] || 'bg-gray-100 text-gray-600'}`}>{r.overall_risk || 'N/A'}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${RISK_BAR_COLORS[r.overall_risk] || 'bg-gray-400'}`}
                    style={{ width: `${Math.max(6, (r.count / Math.max(...stats.riskDistribution.map(x => x.count), 1)) * 100)}%` }} />
                </div>
                <span className="text-xs text-gray-500 font-medium w-6 text-right">{r.count}</span>
              </div>
            ))}
            {stats.riskDistribution.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </div>

        {/* Language usage */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Language usage</h3>
          <div className="space-y-2.5">
            {(stats.languageDistribution || []).map(l => (
              <BarRow key={l.language} label={LANG_LABELS[l.language] || l.language} count={l.count} max={maxLang} />
            ))}
            {!stats.languageDistribution?.length && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </div>
      </div>

      {/* Bottom 2-col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top document types */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Top document types</h3>
          <div className="space-y-2.5">
            {stats.topDocumentTypes.map(d => (
              <BarRow key={d.document_type} label={d.document_type || 'Unknown'} count={d.count} max={maxDoc} color="bg-indigo-500" />
            ))}
            {stats.topDocumentTypes.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </div>

        {/* Recent signups */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Recent signups</h3>
          <div className="space-y-3">
            {(stats.recentSignups || []).map(u => (
              <div key={u.id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.full_name || u.email || u.phone || '—'}</p>
                  <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}</p>
                </div>
                <PlanBadge plan={u.plan} />
              </div>
            ))}
            {!stats.recentSignups?.length && <p className="text-sm text-gray-400">No signups yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const RISK_COLORS = { HIGH: 'text-red-600 bg-red-50', MEDIUM: 'text-yellow-600 bg-yellow-50', LOW: 'text-green-600 bg-green-50' };

function UserDetailDrawer({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUserDetail(userId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">User detail</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="w-8 h-8 text-brand-600" /></div>
        ) : data ? (
          <div className="p-5 space-y-6">
            {/* Identity */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-bold text-gray-900 text-lg">{data.user.full_name || '—'}</p>
              <p className="text-sm text-gray-500">{data.user.email || data.user.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <PlanBadge plan={data.user.plan} />
                <span className="text-xs text-gray-400">Joined {fmtDate(data.user.created_at)}</span>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <div><p className="text-xs text-gray-400">Trial used</p><p className="font-semibold">{data.user.trial_analyses_used}</p></div>
                <div><p className="text-xs text-gray-400">Docs this month</p><p className="font-semibold">{data.user.documents_this_month}</p></div>
                <div><p className="text-xs text-gray-400">Payments</p><p className="font-semibold">{data.payments.length}</p></div>
              </div>
            </div>

            {/* Analyses */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Recent analyses ({data.analyses.length})</p>
              {data.analyses.length === 0 ? <p className="text-sm text-gray-400">No analyses yet.</p> : (
                <div className="space-y-2">
                  {data.analyses.map(a => (
                    <div key={a.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{a.document_type || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{a.language?.toUpperCase()} · {fmt(a.tokens_used)} tokens · {fmtDate(a.created_at)}</p>
                      </div>
                      {a.overall_risk && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${RISK_COLORS[a.overall_risk] || 'bg-gray-100 text-gray-600'}`}>{a.overall_risk}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payments</p>
              {data.payments.length === 0 ? <p className="text-sm text-gray-400">No payments.</p> : (
                <div className="space-y-2">
                  {data.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                      <div>
                        <p className="font-medium text-gray-800 capitalize">{p.plan_type} plan</p>
                        <p className="text-xs text-gray-400">{fmtDate(p.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{fmtGhs(p.amount_ghs)}</p>
                        <span className={`text-xs ${p.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : <p className="p-5 text-gray-400">Failed to load user data.</p>}
      </div>
    </div>
  );
}

function UsersTab() {
  const [rows,       setRows]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [editPlan,   setEditPlan]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [working,    setWorking]    = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [newPlan,    setNewPlan]    = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (search)     params.search = search;
    if (planFilter) params.plan   = planFilter;
    adminApi.users(params)
      .then((d) => { setRows(d.users || []); setTotal(d.pagination.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, planFilter]);

  useEffect(() => { load(); }, [load]);

  async function savePlan(userId) {
    if (!newPlan) return;
    setSaving(true);
    try { await adminApi.updatePlan(userId, newPlan); setEditPlan(null); load(); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function resetUsage(userId, name) {
    if (!confirm(`Reset usage counters for ${name || 'this user'}? Their trial and monthly doc counts will go back to 0.`)) return;
    setWorking(userId);
    try { await adminApi.resetUsage(userId); load(); }
    catch (e) { alert(e.message); }
    finally { setWorking(null); }
  }

  return (
    <div>
      {detail && <UserDetailDrawer userId={detail} onClose={() => setDetail(null)} />}

      <div className="flex flex-wrap gap-3 mb-5">
        <input type="search" placeholder="Search name, email or phone…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input text-sm flex-1 min-w-[200px]" />
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="input text-sm">
          <option value="">All plans</option>
          {ALL_PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner className="w-8 h-8 text-brand-600" /></div>
      ) : (
        <div className="space-y-2">
          {rows.map((u) => (
            <div key={u.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetail(u.id)}>
                  <p className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">{u.full_name || '—'}</p>
                  <p className="text-xs text-gray-500">{u.email || u.phone}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <PlanBadge plan={u.plan} />
                    <span className="text-xs text-gray-400">Docs: {u.documents_this_month} · Trial: {u.trial_analyses_used}</span>
                    <span className="text-xs text-gray-400">Joined {new Date(u.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setDetail(u.id)} className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">View</button>
                  <button onClick={() => resetUsage(u.id, u.full_name)} disabled={working === u.id}
                    className="text-xs text-orange-600 border border-orange-200 bg-orange-50 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50">
                    {working === u.id ? '…' : 'Reset'}
                  </button>
                  <button onClick={() => { setEditPlan(u.id); setNewPlan(u.plan); }}
                    className="text-xs text-brand-600 border border-brand-200 bg-brand-50 px-2.5 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
                    Plan
                  </button>
                </div>
              </div>

              {editPlan === u.id && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <select value={newPlan} onChange={e => setNewPlan(e.target.value)} className="input text-xs py-1.5 flex-1">
                    {ALL_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button onClick={() => savePlan(u.id)} disabled={saving}
                    className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 font-semibold">
                    {saving ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setEditPlan(null)} className="text-xs text-gray-400 px-2">✕</button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No users found.</p>}
        </div>
      )}
      <Pagination page={page} total={total} limit={20} onChange={setPage} />
    </div>
  );
}

function AuditTab() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (eventFilter) params.event_type = eventFilter;
    adminApi.auditLogs(params)
      .then((d) => { setLogs(d.logs || []); setTotal(d.pagination.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, eventFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="mb-5">
        <select
          value={eventFilter}
          onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
          className="input text-sm w-auto"
        >
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t || 'All events'}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner className="w-8 h-8 text-brand-600" /></div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold ${EVENT_COLORS[log.event_type] || 'text-gray-600'}`}>
                    {log.event_type}
                  </span>
                  {log.full_name && <span className="text-xs text-gray-500">{log.full_name}</span>}
                  {log.phone     && <span className="text-xs text-gray-400">{log.phone}</span>}
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                    {JSON.stringify(log.metadata)}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{fmtDate(log.created_at)}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No events found.</p>}
        </div>
      )}
      <Pagination page={page} total={total} limit={25} onChange={setPage} />
    </div>
  );
}

// ─── LawyersTab ───────────────────────────────────────────────────────────────

const SPECIALTIES_OPTIONS = [
  'Employment Law', 'Labour Relations', 'Civil Litigation', 'Human Rights',
  'Land Law', 'Property Law', 'Conveyancing', 'Commercial Law',
  'Contract Law', 'Corporate Law', 'Business Law', 'IP Law',
  'Family Law', 'Inheritance Law', 'Probate', "Children's Rights",
  'Criminal Law', 'Juvenile Justice', 'Fraud & Financial Crime', 'Contracts',
];

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 'Ahafo',
  'Bono East', 'Oti', 'North East', 'Savannah', 'Western North',
];

const EMPTY_LAWYER = {
  name: '', region: 'Greater Accra', specialties: [],
  phone: '', email: '', whatsapp: '', bio: '',
  gba_number: '', consultation_fee_ghs: '', languages: ['en'],
  years_experience: '', verified: true, status: 'active',
};

function LawyerForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function toggleSpecialty(s) {
    set('specialties', form.specialties.includes(s)
      ? form.specialties.filter(x => x !== s)
      : [...form.specialties, s]);
  }

  function submit(e) {
    e.preventDefault();
    onSave({
      ...form,
      consultation_fee_ghs: Number(form.consultation_fee_ghs) || 0,
      years_experience:      Number(form.years_experience)     || 0,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Full name *</label>
          <input required className="input text-sm w-full" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Kwabena Ofori-Atta" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">GBA number</label>
          <input className="input text-sm w-full" value={form.gba_number} onChange={e => set('gba_number', e.target.value)} placeholder="GBA/2015/0789" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Region *</label>
          <select required className="input text-sm w-full" value={form.region} onChange={e => set('region', e.target.value)}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Consultation fee (GH₵)</label>
          <input type="number" min="0" className="input text-sm w-full" value={form.consultation_fee_ghs} onChange={e => set('consultation_fee_ghs', e.target.value)} placeholder="250" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input className="input text-sm w-full" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+233244..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
          <input className="input text-sm w-full" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+233244..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input type="email" className="input text-sm w-full" value={form.email} onChange={e => set('email', e.target.value)} placeholder="lawyer@firm.gh" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Years experience</label>
          <input type="number" min="0" className="input text-sm w-full" value={form.years_experience} onChange={e => set('years_experience', e.target.value)} placeholder="10" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
        <textarea rows={3} className="input text-sm w-full resize-none" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Short professional bio..." />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Specialisations</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES_OPTIONS.map(s => (
            <button type="button" key={s} onClick={() => toggleSpecialty(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                form.specialties.includes(s)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)} className="w-4 h-4 accent-brand-600" />
          <span className="text-sm text-gray-700">Verified</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.status === 'active'} onChange={e => set('status', e.target.checked ? 'active' : 'inactive')} className="w-4 h-4 accent-brand-600" />
          <span className="text-sm text-gray-700">Active (visible to users)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving…' : 'Save lawyer'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

function LawyersTab() {
  const [lawyers,  setLawyers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [panel,    setPanel]    = useState(null); // 'add' | { lawyer } for edit
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // 'all' | specialty

  function load() {
    setLoading(true);
    adminApi.getLawyers()
      .then(d => setLawyers(d.lawyers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  const filtered = lawyers.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.region.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (l.specialties || []).some(s => s.toLowerCase().includes(filter.toLowerCase()));
    return matchSearch && matchFilter;
  });

  async function handleSave(data) {
    setSaving(true);
    try {
      if (panel === 'add') {
        await adminApi.createLawyer(data);
      } else {
        await adminApi.updateLawyer(panel.lawyer.id, data);
      }
      setPanel(null);
      load();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(lawyer) {
    if (!confirm(`Remove ${lawyer.name} from the directory? This cannot be undone.`)) return;
    try {
      await adminApi.deleteLawyer(lawyer.id);
      load();
    } catch (e) { alert(e.message); }
  }

  async function toggleVerified(lawyer) {
    try {
      await adminApi.updateLawyer(lawyer.id, { ...lawyer, verified: !lawyer.verified });
      load();
    } catch (e) { alert(e.message); }
  }

  const SPECIALTY_GROUPS = ['Employment Law', 'Land Law', 'Contract Law', 'Family Law', 'Criminal Law'];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2 flex-1">
          <input
            type="search" placeholder="Search name or region…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input text-sm flex-1 min-w-[180px]"
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input text-sm w-auto">
            <option value="all">All specialisations</option>
            {SPECIALTY_GROUPS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={() => setPanel('add')}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add lawyer
        </button>
      </div>

      {/* Add / Edit form panel */}
      {panel && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">
            {panel === 'add' ? 'Add new lawyer' : `Edit: ${panel.lawyer.name}`}
          </h3>
          <LawyerForm
            initial={panel === 'add' ? EMPTY_LAWYER : { ...panel.lawyer, specialties: panel.lawyer.specialties || [], languages: panel.lawyer.languages || ['en'] }}
            onSave={handleSave}
            onCancel={() => setPanel(null)}
            saving={saving}
          />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total lawyers',  value: lawyers.length },
          { label: 'Verified',       value: lawyers.filter(l => l.verified).length },
          { label: 'Active',         value: lawyers.filter(l => l.status === 'active').length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lawyer cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-brand-600" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lawyer => (
            <div key={lawyer.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-4">

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ background: '#1B4332' }}>
                <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                  <ellipse cx="20" cy="36" rx="13" ry="8" fill="#52B788" opacity="0.85" />
                  <circle cx="20" cy="16" r="8" fill="#52B788" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{lawyer.name}</span>
                  {lawyer.verified
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">✓ Verified</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Unverified</span>
                  }
                  {lawyer.status === 'inactive' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{lawyer.region} · GBA: {lawyer.gba_number || '—'} · {lawyer.years_experience || 0} yrs · GH₵{lawyer.consultation_fee_ghs || 0}/consult</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(lawyer.specialties || []).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">{s}</span>
                  ))}
                </div>
                {lawyer.bio && <p className="text-xs text-gray-500 line-clamp-2">{lawyer.bio}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  {lawyer.phone   && <span>📞 {lawyer.phone}</span>}
                  {lawyer.whatsapp && <span>💬 {lawyer.whatsapp}</span>}
                  {lawyer.email   && <span>✉ {lawyer.email}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => setPanel({ lawyer })}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleVerified(lawyer)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    lawyer.verified
                      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {lawyer.verified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  onClick={() => handleDelete(lawyer)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              {search ? 'No lawyers match your search.' : 'No lawyers yet. Click "Add lawyer" to get started.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── LawyerApplicationsTab ────────────────────────────────────────────────────

function LawyerApplicationsTab() {
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [notes,    setNotes]    = useState({});
  const [working,  setWorking]  = useState(null);

  function load(status) {
    setLoading(true);
    adminApi.getLawyerApplications(status)
      .then(d => setApps(d.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(filter); }, [filter]);

  async function handleReview(id, action) {
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this application? ${action === 'approve' ? 'The lawyer will be added to the public directory.' : ''}`)) return;
    setWorking(id);
    try {
      await adminApi.reviewLawyerApplication(id, action, notes[id] || '');
      load(filter);
      setExpanded(null);
    } catch (e) { alert(e.message); }
    finally { setWorking(null); }
  }

  const STATUS_COLOR = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-semibold text-gray-800">Lawyer Applications</h2>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-brand-600" /></div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No {filter === 'all' ? '' : filter} applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex flex-wrap items-start gap-4 cursor-pointer" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{app.full_name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[app.status] || 'bg-gray-100 text-gray-600'}`}>{app.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{app.region} · GBA {app.gba_number} · {app.years_experience} yrs exp</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(app.specialties || []).map(s => (
                      <span key={s} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{fmtDate(app.created_at)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{app.email}</p>
                  <p className="text-xs text-gray-500">{app.phone}</p>
                </div>
              </div>

              {expanded === app.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{app.bio}</p>
                  </div>
                  {app.docs_url && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Verification documents</p>
                      <a href={app.docs_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline break-all">{app.docs_url}</a>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contact</p>
                    <p className="text-sm text-gray-600">{app.email} · {app.phone}{app.whatsapp && ` · WA: ${app.whatsapp}`}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Consultation fee</p>
                    <p className="text-sm text-gray-600">GH₵ {Number(app.consultation_fee_ghs).toFixed(0)} / session · Languages: {(app.languages || ['en']).join(', ')}</p>
                  </div>
                  {app.admin_notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin notes</p>
                      <p className="text-sm text-gray-600">{app.admin_notes}</p>
                    </div>
                  )}
                  {app.status === 'pending' && (
                    <div className="space-y-3 pt-2">
                      <textarea
                        value={notes[app.id] || ''}
                        onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                        placeholder="Admin notes (optional, visible in audit log)..."
                        rows={2}
                        className="input text-sm w-full resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(app.id, 'approve')}
                          disabled={working === app.id}
                          className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {working === app.id ? <Spinner className="w-4 h-4" /> : '✓'} Approve & list lawyer
                        </button>
                        <button
                          onClick={() => handleReview(app.id, 'reject')}
                          disabled={working === app.id}
                          className="px-5 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Users', 'Lawyers', 'Applications', 'Audit Log'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const admin    = getAdmin();
  const [tab,   setTab]   = useState('Overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch((e) => {
        if (e.status === 401) { clearAdminSession(); navigate('/admin'); }
      });
  }, [navigate]);

  function logout() {
    clearAdminSession();
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logos/logo.png" alt="Klaro" className="h-7 object-contain brightness-0 invert" />
            <span className="text-gray-500 text-sm border-l border-gray-700 pl-3">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">{admin?.phone}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition-colors">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit mb-8 shadow-sm flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t}
              {t === 'Applications' && stats?.pendingApplications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {stats.pendingApplications}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'Overview'      && <OverviewTab stats={stats} onTabChange={setTab} />}
        {tab === 'Users'         && <UsersTab />}
        {tab === 'Lawyers'       && <LawyersTab />}
        {tab === 'Applications'  && <LawyerApplicationsTab />}
        {tab === 'Audit Log'     && <AuditTab />}
      </main>
    </div>
  );
}
