import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/adminApi';
import { clearAdminSession, getAdmin } from '../lib/adminAuth';
import { startPreview } from '../components/PreviewBanner';
import Spinner from '../components/Spinner';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n)      { return (n ?? 0).toLocaleString(); }
function fmtGhs(n)   { return `GH₵ ${Number(n ?? 0).toFixed(2)}`; }
function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function downloadCSV(filename, rows, columns) {
  if (!rows.length) { alert('No data to export.'); return; }
  const header = columns.map(c => JSON.stringify(c.label)).join(',');
  const body   = rows.map(row =>
    columns.map(c => {
      const val = typeof c.get === 'function' ? c.get(row) : (row[c.key] ?? '');
      return JSON.stringify(String(val));
    }).join(',')
  );
  const csv  = [header, ...body].join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `klaro_${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── constants ───────────────────────────────────────────────────────────────

const PLAN_COLORS = {
  trial:        'bg-gray-100 text-gray-600',
  pay_per_doc:  'bg-orange-100 text-orange-700',
  individual:   'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  business:     'bg-emerald-100 text-emerald-700',
};

const EVENT_COLORS = {
  'user.register':       'text-blue-600',
  'user.login':          'text-green-600',
  'analysis.create':     'text-indigo-600',
  'payment.success':     'text-emerald-600',
  'admin.login':         'text-orange-600',
  'admin.plan_change':   'text-purple-600',
  'admin.user_blocked':  'text-red-600',
  'admin.user_unblocked':'text-green-600',
  'admin.ip_blocked':    'text-red-600',
  'admin.ip_unblocked':  'text-green-600',
};

const ALL_PLANS = ['trial', 'pay_per_doc', 'individual', 'professional', 'business'];

const EVENT_TYPES = [
  '', 'user.register', 'user.login', 'analysis.create',
  'payment.success', 'admin.login', 'admin.plan_change',
  'admin.user_blocked', 'admin.user_unblocked',
];

const RISK_BAR_COLORS = { HIGH: 'bg-red-500', MEDIUM: 'bg-yellow-400', LOW: 'bg-green-500' };
const RISK_COLORS      = { HIGH: 'text-red-600 bg-red-50', MEDIUM: 'text-yellow-600 bg-yellow-50', LOW: 'text-green-600 bg-green-50' };
const LANG_LABELS      = { en: 'English', tw: 'Twi', ga: 'Ga', ewe: 'Ewe', dag: 'Dagbani', ha: 'Hausa', fan: 'Fante' };

// ─── shared sub-components ───────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, accent = '#52B788' }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm overflow-hidden relative"
         style={{ borderTop: `3px solid ${accent}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: `${accent}18`, color: accent }}>
            {icon}
          </div>
        )}
      </div>
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
    <div className="flex items-center justify-between mt-5 text-sm text-gray-500">
      <span className="text-xs">Page {page} of {totalPages} · {fmt(total)} total</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 text-xs font-medium">
          ← Prev
        </button>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 text-xs font-medium">
          Next →
        </button>
      </div>
    </div>
  );
}

function BarRow({ label, count, max, color = 'bg-[#52B788]' }) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 4;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-600 w-32 truncate flex-shrink-0 text-xs">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-500 font-semibold w-8 text-right flex-shrink-0 text-xs">{count}</span>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">{title}</h3>
      {children}
    </div>
  );
}

// ─── OverviewTab ─────────────────────────────────────────────────────────────

function OverviewTab({ stats, onTabChange }) {
  if (!stats) return (
    <div className="flex justify-center py-20">
      <Spinner className="w-8 h-8 text-[#52B788]" />
    </div>
  );

  const avgSec  = stats.analyses.avgProcessingMs > 0 ? (stats.analyses.avgProcessingMs / 1000).toFixed(1) : '—';
  const maxDoc  = Math.max(...(stats.topDocumentTypes.map(d => d.count)), 1);
  const maxLang = Math.max(...(stats.languageDistribution?.map(l => l.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Pending applications alert */}
      {stats.pendingApplications > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                {stats.pendingApplications} pending lawyer application{stats.pendingApplications !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600">Lawyers waiting for review and approval</p>
            </div>
          </div>
          <button onClick={() => onTabChange('Applications')}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors flex-shrink-0">
            Review →
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total users" value={fmt(stats.users.total)} sub={`+${fmt(stats.users.last30d)} last 30d`}
          accent="#1B4332"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Total analyses" value={fmt(stats.analyses.total)} sub={`+${fmt(stats.analyses.last30d)} last 30d`}
          accent="#52B788"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label="Total revenue" value={fmtGhs(stats.revenue.totalGhs)} sub={`${fmtGhs(stats.revenue.last30dGhs)} last 30d`}
          accent="#D4A017"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Avg. analysis" value={`${avgSec}s`} sub={`${fmt(stats.analyses.totalTokens)} tokens total`}
          accent="#6366F1"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>

      {/* Templates stats */}
      {stats.templates && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            label="Templates generated" value={fmt(stats.templates.total)} sub={`+${fmt(stats.templates.last30d)} last 30d`}
            accent="#0891B2"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          />
          {stats.templates.topTypes?.length > 0 && (
            <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ borderTop: '3px solid #0891B2' }}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top template types</p>
              <div className="space-y-2">
                {stats.templates.topTypes.map(tt => (
                  <BarRow key={tt.template_type} label={tt.template_type} count={tt.count} max={stats.templates.topTypes[0]?.count || 1} color="bg-cyan-500" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily activity bar chart */}
      <SectionCard title="Daily analyses — last 14 days">
        {stats.dailyActivity.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="flex items-end gap-1.5 h-28">
            {stats.dailyActivity.map((d) => {
              const max = Math.max(...stats.dailyActivity.map(x => x.count), 1);
              const pct = Math.round((d.count / max) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.day}: ${d.count}`}>
                  <span className="text-xs text-gray-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                  <div className="w-full bg-[#52B788] rounded-t hover:bg-[#1B4332] transition-colors" style={{ height: `${Math.max(pct, 3)}%` }} />
                  <span className="text-gray-400 hidden sm:block" style={{ fontSize: 9 }}>
                    {new Date(d.day).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SectionCard title="Plan distribution">
          <div className="space-y-2.5">
            {stats.planDistribution.map((p) => (
              <div key={p.plan} className="flex items-center justify-between">
                <PlanBadge plan={p.plan} />
                <span className="text-sm font-semibold text-gray-700">{fmt(p.count)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Risk distribution">
          <div className="space-y-3">
            {stats.riskDistribution.map((r) => (
              <div key={r.overall_risk} className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${RISK_COLORS[r.overall_risk] || 'bg-gray-100 text-gray-600'}`}>
                  {r.overall_risk || 'N/A'}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${RISK_BAR_COLORS[r.overall_risk] || 'bg-gray-400'}`}
                    style={{ width: `${Math.max(6, (r.count / Math.max(...stats.riskDistribution.map(x => x.count), 1)) * 100)}%` }} />
                </div>
                <span className="text-xs text-gray-500 font-semibold w-6 text-right">{r.count}</span>
              </div>
            ))}
            {stats.riskDistribution.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Language usage">
          <div className="space-y-2.5">
            {(stats.languageDistribution || []).map(l => (
              <BarRow key={l.language} label={LANG_LABELS[l.language] || l.language} count={l.count} max={maxLang} />
            ))}
            {!stats.languageDistribution?.length && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </SectionCard>
      </div>

      {/* Bottom 2-col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard title="Top document types">
          <div className="space-y-2.5">
            {stats.topDocumentTypes.map(d => (
              <BarRow key={d.document_type} label={d.document_type || 'Unknown'} count={d.count} max={maxDoc} color="bg-indigo-500" />
            ))}
            {stats.topDocumentTypes.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Recent signups">
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
        </SectionCard>
      </div>
    </div>
  );
}

// ─── UserDetailDrawer ─────────────────────────────────────────────────────────

function getInitials(name, email, phone) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
  }
  return ((email || phone || '?').slice(0, 2)).toUpperCase();
}

function UserDetailDrawer({ userId, onClose, onUpdated }) {
  const navigate = useNavigate();
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [editPlan,      setEditPlan]      = useState(false);
  const [newPlan,       setNewPlan]       = useState('');
  const [savingPlan,    setSavingPlan]    = useState(false);
  const [blocking,      setBlocking]      = useState(false);
  const [resetting,     setResetting]     = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  function reload() {
    setLoading(true);
    adminApi.getUserDetail(userId)
      .then(d => { setData(d); setNewPlan(d.user.plan); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, [userId]);

  async function handleBlock() {
    if (!data) return;
    const willBlock = !data.user.blocked;
    if (!confirm(`${willBlock ? 'Block' : 'Unblock'} ${data.user.full_name || data.user.email}?${willBlock ? ' They will be unable to log in.' : ''}`)) return;
    setBlocking(true);
    try { await adminApi.blockUser(userId, willBlock); reload(); onUpdated?.(); }
    catch (e) { alert(e.message); }
    finally { setBlocking(false); }
  }

  async function handleSavePlan() {
    if (!newPlan) return;
    setSavingPlan(true);
    try { await adminApi.updatePlan(userId, newPlan); setEditPlan(false); reload(); onUpdated?.(); }
    catch (e) { alert(e.message); }
    finally { setSavingPlan(false); }
  }

  async function handleResetUsage() {
    if (!data) return;
    if (!confirm(`Reset usage counters for ${data.user.full_name || 'this user'}?`)) return;
    setResetting(true);
    try { await adminApi.resetUsage(userId); reload(); onUpdated?.(); }
    catch (e) { alert(e.message); }
    finally { setResetting(false); }
  }

  async function handleImpersonate() {
    if (!data) return;
    if (!confirm(`Preview app as ${data.user.full_name || data.user.email}? A temporary 15-min session will be created.`)) return;
    setImpersonating(true);
    try {
      const { token, user } = await adminApi.impersonateUser(userId);
      startPreview(token, user);
      navigate('/dashboard');
    } catch (e) {
      alert(e.message);
    } finally {
      setImpersonating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900">User profile</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-xl leading-none">&times;</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="w-8 h-8 text-[#52B788]" /></div>
        ) : data ? (
          <div className="p-5 space-y-5">

            {/* Profile card */}
            <div className="bg-gradient-to-br from-[#1B4332] to-[#2d6a4f] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#52B788] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-[#1B4332] font-black text-2xl">
                    {getInitials(data.user.full_name, data.user.email, data.user.phone)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xl leading-tight">{data.user.full_name || '—'}</p>
                  {data.user.email && <p className="text-[#52B788] text-sm">{data.user.email}</p>}
                  {data.user.phone && <p className="text-[#52B788] text-sm">{data.user.phone}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLAN_COLORS[data.user.plan] || 'bg-gray-100 text-gray-600'}`}>
                  {data.user.plan}
                </span>
                {data.user.blocked && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">Blocked</span>
                )}
                <span className="text-xs text-[#52B788]/80">Joined {fmtDate(data.user.created_at)}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Analyses',    value: data.analyses.length },
                  { label: 'This month',  value: data.user.documents_this_month },
                  { label: 'Payments',    value: data.payments.length },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl py-2.5 text-center backdrop-blur-sm">
                    <p className="text-xl font-black">{value}</p>
                    <p className="text-[10px] text-[#52B788]/80 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setEditPlan(e => !e)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border border-[#52B788]/40 text-[#1B4332] bg-[#52B788]/10 hover:bg-[#52B788]/20 transition-colors text-xs font-semibold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Change Plan
              </button>
              <button
                onClick={handleResetUsage}
                disabled={resetting}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors text-xs font-semibold disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {resetting ? '…' : 'Reset Usage'}
              </button>
              <button
                onClick={handleBlock}
                disabled={blocking}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors text-xs font-semibold disabled:opacity-50 ${
                  data.user.blocked
                    ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                    : 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={data.user.blocked
                    ? 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z'
                    : 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  } />
                </svg>
                {blocking ? '…' : data.user.blocked ? 'Unblock' : 'Block User'}
              </button>
            </div>

            {/* Preview as user */}
            <button
              onClick={handleImpersonate}
              disabled={impersonating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {impersonating ? 'Starting preview…' : 'Preview as this user'}
            </button>

            {/* Plan change form */}
            {editPlan && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium flex-shrink-0">New plan:</span>
                <select value={newPlan} onChange={e => setNewPlan(e.target.value)} className="input text-sm flex-1 py-1.5">
                  {ALL_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={handleSavePlan} disabled={savingPlan}
                  className="text-xs bg-[#1B4332] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap">
                  {savingPlan ? '…' : 'Save'}
                </button>
                <button onClick={() => setEditPlan(false)} className="text-gray-400 hover:text-gray-600 px-1 text-lg leading-none">&times;</button>
              </div>
            )}

            {/* Analyses */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Recent analyses ({data.analyses.length})
              </p>
              {data.analyses.length === 0 ? (
                <p className="text-sm text-gray-400">No analyses yet.</p>
              ) : (
                <div className="space-y-0 divide-y divide-gray-50">
                  {data.analyses.map(a => (
                    <div key={a.id} className="flex items-center justify-between gap-2 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{a.document_type || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {(a.language || 'en').toUpperCase()} · {fmt(a.tokens_used)} tokens · {fmtDate(a.created_at)}
                        </p>
                      </div>
                      {a.overall_risk && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${RISK_COLORS[a.overall_risk] || 'bg-gray-100 text-gray-600'}`}>
                          {a.overall_risk}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment history</p>
              {data.payments.length === 0 ? (
                <p className="text-sm text-gray-400">No payments.</p>
              ) : (
                <div className="space-y-0 divide-y divide-gray-50">
                  {data.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">{p.plan_type} plan</p>
                        <p className="text-xs text-gray-400">{fmtDate(p.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{fmtGhs(p.amount_ghs)}</p>
                        <span className={`text-xs font-medium ${p.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="p-5 text-gray-400">Failed to load user data.</p>
        )}
      </div>
    </div>
  );
}

// ─── UsersTab ─────────────────────────────────────────────────────────────────

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
  const [blockWork,  setBlockWork]  = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [newPlan,    setNewPlan]    = useState('');
  const [exporting,  setExporting]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (search)     params.search = search;
    if (planFilter) params.plan   = planFilter;
    adminApi.users(params)
      .then(d => { setRows(d.users || []); setTotal(d.pagination.total); })
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
    if (!confirm(`Reset usage counters for ${name || 'this user'}?`)) return;
    setWorking(userId);
    try { await adminApi.resetUsage(userId); load(); }
    catch (e) { alert(e.message); }
    finally { setWorking(null); }
  }

  async function toggleBlock(user) {
    const action = user.blocked ? 'unblock' : 'block';
    if (!confirm(`${action === 'block' ? 'Block' : 'Unblock'} ${user.full_name || user.email}? ${action === 'block' ? 'They will be unable to log in.' : ''}`)) return;
    setBlockWork(user.id);
    try { await adminApi.blockUser(user.id, !user.blocked); load(); }
    catch (e) { alert(e.message); }
    finally { setBlockWork(null); }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const d = await adminApi.exportUsers({ search, plan: planFilter });
      downloadCSV('users', d.users, [
        { label: 'ID',             key: 'id' },
        { label: 'Name',           key: 'full_name' },
        { label: 'Email',          key: 'email' },
        { label: 'Phone',          key: 'phone' },
        { label: 'Plan',           key: 'plan' },
        { label: 'Docs/month',     key: 'documents_this_month' },
        { label: 'Trial used',     key: 'trial_analyses_used' },
        { label: 'Blocked',        get: u => u.blocked ? 'Yes' : 'No' },
        { label: 'Joined',         get: u => fmtDate(u.created_at) },
      ]);
    } catch (e) { alert(e.message); }
    finally { setExporting(false); }
  }

  return (
    <div>
      {detail && <UserDetailDrawer userId={detail} onClose={() => setDetail(null)} onUpdated={load} />}

      {/* Filters + export */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="search" placeholder="Search name, email or phone…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input text-sm flex-1 min-w-[200px]" />
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="input text-sm">
          <option value="">All plans</option>
          {ALL_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* User count */}
      <p className="text-xs text-gray-400 mb-3">{fmt(total)} user{total !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-[#52B788]" /></div>
      ) : (
        <div className="space-y-2">
          {rows.map(u => (
            <div key={u.id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-colors ${u.blocked ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetail(u.id)}>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-gray-900 hover:text-[#1B4332] transition-colors">{u.full_name || '—'}</p>
                    {u.blocked && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Blocked</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{u.email || u.phone}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <PlanBadge plan={u.plan} />
                    <span className="text-xs text-gray-400">Docs: {u.documents_this_month} · Trial: {u.trial_analyses_used}</span>
                    <span className="text-xs text-gray-400">
                      Joined {new Date(u.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button onClick={() => setDetail(u.id)}
                    className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    View
                  </button>
                  <button onClick={() => resetUsage(u.id, u.full_name)} disabled={working === u.id}
                    className="text-xs text-orange-600 border border-orange-200 bg-orange-50 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50">
                    {working === u.id ? '…' : 'Reset'}
                  </button>
                  <button onClick={() => { setEditPlan(u.id); setNewPlan(u.plan); }}
                    className="text-xs text-[#1B4332] border border-[#52B788]/40 bg-[#52B788]/10 px-2.5 py-1.5 rounded-lg hover:bg-[#52B788]/20 transition-colors">
                    Plan
                  </button>
                  <button onClick={() => toggleBlock(u)} disabled={blockWork === u.id}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                      u.blocked
                        ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                        : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                    }`}>
                    {blockWork === u.id ? '…' : u.blocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </div>

              {editPlan === u.id && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <select value={newPlan} onChange={e => setNewPlan(e.target.value)} className="input text-xs py-1.5 flex-1">
                    {ALL_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button onClick={() => savePlan(u.id)} disabled={saving}
                    className="text-xs bg-[#1B4332] text-white px-3 py-1.5 rounded-lg disabled:opacity-50 font-semibold">
                    {saving ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setEditPlan(null)} className="text-xs text-gray-400 px-2">✕</button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs mt-1">Try changing your filters</p>
            </div>
          )}
        </div>
      )}
      <Pagination page={page} total={total} limit={20} onChange={setPage} />
    </div>
  );
}

// ─── AuditTab ─────────────────────────────────────────────────────────────────

function AuditTab() {
  const [logs,        setLogs]        = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [eventFilter, setEventFilter] = useState('');
  const [exporting,   setExporting]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (eventFilter) params.event_type = eventFilter;
    adminApi.auditLogs(params)
      .then(d => { setLogs(d.logs || []); setTotal(d.pagination.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, eventFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleExport() {
    setExporting(true);
    try {
      const d = await adminApi.exportAudit({ event_type: eventFilter });
      downloadCSV('audit_log', d.logs, [
        { label: 'Event',    key: 'event_type' },
        { label: 'User',     key: 'full_name' },
        { label: 'Email',    key: 'email' },
        { label: 'Phone',    key: 'phone' },
        { label: 'Metadata', get: l => JSON.stringify(l.metadata || {}) },
        { label: 'Date',     get: l => fmtDate(l.created_at) },
      ]);
    } catch (e) { alert(e.message); }
    finally { setExporting(false); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={eventFilter} onChange={(e) => { setEventFilter(e.target.value); setPage(1); }} className="input text-sm flex-1 min-w-[180px]">
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t || 'All events'}</option>)}
        </select>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-[#52B788]" /></div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold ${EVENT_COLORS[log.event_type] || 'text-gray-600'}`}>
                    {log.event_type}
                  </span>
                  {log.full_name && <span className="text-xs text-gray-600 font-medium">{log.full_name}</span>}
                  {log.email     && <span className="text-xs text-gray-400">{log.email}</span>}
                  {log.phone     && !log.email && <span className="text-xs text-gray-400">{log.phone}</span>}
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
          {logs.length === 0 && <p className="text-center text-sm text-gray-400 py-12">No events found.</p>}
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
    onSave({ ...form, consultation_fee_ghs: Number(form.consultation_fee_ghs) || 0, years_experience: Number(form.years_experience) || 0 });
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
                  ? 'bg-[#1B4332] text-white border-[#1B4332]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#52B788]'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)} className="w-4 h-4 accent-[#1B4332]" />
          <span className="text-sm text-gray-700">Verified</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.status === 'active'} onChange={e => set('status', e.target.checked ? 'active' : 'inactive')} className="w-4 h-4 accent-[#1B4332]" />
          <span className="text-sm text-gray-700">Active (visible to users)</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-sm font-semibold disabled:opacity-50 hover:bg-[#163829] transition-colors">
          {saving ? 'Saving…' : 'Save lawyer'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

function LawyersTab() {
  const [lawyers,  setLawyers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [panel,    setPanel]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [exporting, setExporting] = useState(false);

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
      if (panel === 'add') await adminApi.createLawyer(data);
      else await adminApi.updateLawyer(panel.lawyer.id, data);
      setPanel(null);
      load();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(lawyer) {
    if (!confirm(`Remove ${lawyer.name} from the directory? This cannot be undone.`)) return;
    try { await adminApi.deleteLawyer(lawyer.id); load(); }
    catch (e) { alert(e.message); }
  }

  async function toggleVerified(lawyer) {
    try { await adminApi.updateLawyer(lawyer.id, { ...lawyer, verified: !lawyer.verified }); load(); }
    catch (e) { alert(e.message); }
  }

  function handleExport() {
    setExporting(true);
    downloadCSV('lawyers', filtered, [
      { label: 'Name',           key: 'name' },
      { label: 'Region',         key: 'region' },
      { label: 'GBA Number',     key: 'gba_number' },
      { label: 'Specialties',    get: l => (l.specialties || []).join('; ') },
      { label: 'Phone',          key: 'phone' },
      { label: 'Email',          key: 'email' },
      { label: 'WhatsApp',       key: 'whatsapp' },
      { label: 'Verified',       get: l => l.verified ? 'Yes' : 'No' },
      { label: 'Status',         key: 'status' },
      { label: 'Years exp',      key: 'years_experience' },
      { label: 'Consultation GH₵', key: 'consultation_fee_ghs' },
    ]);
    setExporting(false);
  }

  const SPECIALTY_GROUPS = ['Employment Law', 'Land Law', 'Contract Law', 'Family Law', 'Criminal Law'];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2 flex-1">
          <input type="search" placeholder="Search name or region…" value={search} onChange={e => setSearch(e.target.value)}
            className="input text-sm flex-1 min-w-[180px]" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input text-sm">
            <option value="all">All specialisations</option>
            {SPECIALTY_GROUPS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </button>
          <button onClick={() => setPanel('add')}
            className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#163829] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add lawyer
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
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
          { label: 'Total',    value: lawyers.length,                            color: '#1B4332' },
          { label: 'Verified', value: lawyers.filter(l => l.verified).length,    color: '#52B788' },
          { label: 'Active',   value: lawyers.filter(l => l.status === 'active').length, color: '#D4A017' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center" style={{ borderTop: `2px solid ${s.color}` }}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lawyer cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-[#52B788]" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lawyer => (
            <div key={lawyer.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ background: '#1B4332' }}>
                <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                  <ellipse cx="20" cy="36" rx="13" ry="8" fill="#52B788" opacity="0.85" />
                  <circle cx="20" cy="16" r="8" fill="#52B788" />
                </svg>
              </div>
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
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#52B788]/10 text-[#1B4332] border border-[#52B788]/20">{s}</span>
                  ))}
                </div>
                {lawyer.bio && <p className="text-xs text-gray-500 line-clamp-2">{lawyer.bio}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  {lawyer.phone   && <span>📞 {lawyer.phone}</span>}
                  {lawyer.whatsapp && <span>💬 {lawyer.whatsapp}</span>}
                  {lawyer.email   && <span>✉ {lawyer.email}</span>}
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <button onClick={() => setPanel({ lawyer })}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Edit
                </button>
                <button onClick={() => toggleVerified(lawyer)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    lawyer.verified ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}>
                  {lawyer.verified ? 'Unverify' : 'Verify'}
                </button>
                <button onClick={() => handleDelete(lawyer)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
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
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this application?${action === 'approve' ? ' The lawyer will be added to the public directory.' : ''}`)) return;
    setWorking(id);
    try {
      await adminApi.reviewLawyerApplication(id, action, notes[id] || '');
      load(filter);
      setExpanded(null);
    } catch (e) { alert(e.message); }
    finally { setWorking(null); }
  }

  const STATUS_COLOR = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gray-500">{apps.length} application{apps.length !== 1 ? 's' : ''} shown</p>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === s ? 'bg-[#1B4332] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-[#52B788]" /></div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium text-sm">No {filter === 'all' ? '' : filter} applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 flex flex-wrap items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{app.full_name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[app.status] || 'bg-gray-100 text-gray-600'}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{app.region} · GBA {app.gba_number} · {app.years_experience} yrs</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(app.specialties || []).map(s => (
                      <span key={s} className="text-xs bg-[#52B788]/10 text-[#1B4332] border border-[#52B788]/20 rounded-full px-2 py-0.5">{s}</span>
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
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{app.bio}</p>
                  </div>
                  {app.docs_url && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Verification documents</p>
                      <a href={app.docs_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1B4332] hover:underline break-all">{app.docs_url}</a>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contact</p>
                    <p className="text-sm text-gray-600">{app.email} · {app.phone}{app.whatsapp && ` · WA: ${app.whatsapp}`}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Fee & Languages</p>
                    <p className="text-sm text-gray-600">GH₵ {Number(app.consultation_fee_ghs).toFixed(0)} / session · {(app.languages || ['en']).join(', ')}</p>
                  </div>
                  {app.admin_notes && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Admin notes</p>
                      <p className="text-sm text-gray-600">{app.admin_notes}</p>
                    </div>
                  )}
                  {app.status === 'pending' && (
                    <div className="space-y-3 pt-2">
                      <textarea value={notes[app.id] || ''} onChange={e => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                        placeholder="Admin notes (optional)…" rows={2} className="input text-sm w-full resize-none" />
                      <div className="flex gap-3">
                        <button onClick={() => handleReview(app.id, 'approve')} disabled={working === app.id}
                          className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                          {working === app.id ? <Spinner className="w-4 h-4" /> : '✓'} Approve & list lawyer
                        </button>
                        <button onClick={() => handleReview(app.id, 'reject')} disabled={working === app.id}
                          className="px-5 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors">
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

// ─── SecurityTab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [ips,     setIPs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIP,   setNewIP]   = useState('');
  const [reason,  setReason]  = useState('');
  const [adding,  setAdding]  = useState(false);
  const [removing, setRemoving] = useState(null);

  function load() {
    setLoading(true);
    adminApi.getBlockedIPs()
      .then(d => setIPs(d.ips || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newIP.trim()) return;
    setAdding(true);
    try {
      await adminApi.addBlockedIP(newIP.trim(), reason.trim());
      setNewIP('');
      setReason('');
      load();
    } catch (err) { alert(err.message); }
    finally { setAdding(false); }
  }

  async function handleRemove(ip) {
    if (!confirm(`Unblock ${ip}?`)) return;
    setRemoving(ip);
    try { await adminApi.removeBlockedIP(ip); load(); }
    catch (e) { alert(e.message); }
    finally { setRemoving(null); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800">IP Blocking</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Blocked IPs are denied access to all user-facing API routes. Admin routes remain accessible from all IPs.
            Changes take effect within 2 minutes.
          </p>
        </div>
      </div>

      {/* Add IP form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm">Block an IP address</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">IP address *</label>
              <input
                type="text"
                value={newIP}
                onChange={e => setNewIP(e.target.value)}
                placeholder="e.g. 203.0.113.42"
                className="input text-sm w-full font-mono"
                required
                pattern="^(\d{1,3}\.){3}\d{1,3}$"
                title="Enter a valid IPv4 address"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Spam / abuse"
                className="input text-sm w-full"
              />
            </div>
          </div>
          <button type="submit" disabled={adding || !newIP.trim()}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            {adding ? 'Blocking…' : 'Block IP'}
          </button>
        </form>
      </div>

      {/* Blocked IPs table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Blocked IPs ({ips.length})</h3>
          {loading && <Spinner className="w-4 h-4 text-[#52B788]" />}
        </div>
        {ips.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">No IPs blocked.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {ips.map(entry => (
              <div key={entry.id} className="px-5 py-3 flex items-center gap-4">
                <code className="text-sm font-mono text-gray-800 flex-shrink-0">{entry.ip}</code>
                <p className="text-xs text-gray-400 flex-1 truncate">{entry.reason || 'No reason given'}</p>
                <p className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{fmtDate(entry.created_at)}</p>
                <button
                  onClick={() => handleRemove(entry.ip)}
                  disabled={removing === entry.ip}
                  className="text-xs text-green-600 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {removing === entry.ip ? '…' : 'Unblock'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TemplatesTab ────────────────────────────────────────────────────────────

const TEMPLATE_TYPE_LABELS = {
  tenancy: 'Tenancy Agreement', employment: 'Employment Contract', nda: 'NDA',
  freelance: 'Freelance Contract', loan: 'Loan Agreement', music: 'Music Contract',
  partnership: 'Partnership Agreement', sales: 'Sales Agreement', service: 'Service Agreement', will: 'Will & Testament',
};

function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [deleting,  setDeleting]  = useState(null);

  function load(p = 1) {
    setLoading(true);
    adminApi.getTemplates({ page: p })
      .then(d => { setTemplates(d.templates || []); setTotal(d.pagination?.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(page); }, [page]);

  async function handleDelete(id) {
    if (!confirm('Delete this template permanently?')) return;
    setDeleting(id);
    try { await adminApi.deleteTemplate(id); load(page); }
    catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">All Generated Templates ({fmt(total)})</h3>
          {loading && <Spinner className="w-4 h-4 text-[#52B788]" />}
        </div>
        {!loading && templates.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No templates generated yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {templates.map(t => (
              <div key={t.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {t.title || TEMPLATE_TYPE_LABELS[t.template_type] || t.template_type}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {t.full_name || t.email || 'Unknown user'} · {t.country} · {t.language?.toUpperCase()} · {fmtDate(t.created_at)}
                  </p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block">
                  {TEMPLATE_TYPE_LABELS[t.template_type] || t.template_type}
                </span>
                {t.tokens_used > 0 && (
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden md:block">{fmt(t.tokens_used)} tok</span>
                )}
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="text-xs text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {deleting === t.id ? '…' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} total={total} limit={20} onChange={p => { setPage(p); load(p); }} />
      </div>
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: 'Overview', label: 'Overview',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
  },
  {
    id: 'Users', label: 'Users',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    id: 'Lawyers', label: 'Lawyers',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  },
  {
    id: 'Applications', label: 'Applications',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
  {
    id: 'Audit Log', label: 'Audit Log',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    id: 'Templates', label: 'Templates',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    id: 'Security', label: 'Security',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  },
];

const PAGE_TITLES = {
  Overview:     { title: 'Overview',          sub: 'Platform metrics and activity at a glance' },
  Users:        { title: 'Users',             sub: 'Manage accounts, plans, and access' },
  Lawyers:      { title: 'Lawyer Directory',  sub: 'Manage the public lawyer directory' },
  Applications: { title: 'Applications',      sub: 'Review lawyer applications for the directory' },
  'Audit Log':  { title: 'Audit Log',         sub: 'All platform events and admin actions' },
  Templates:    { title: 'Templates',         sub: 'All AI-generated legal document templates' },
  Security:     { title: 'Security',          sub: 'IP blocking and access control' },
};

// ─── main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const admin    = getAdmin();
  const [tab,         setTab]         = useState('Overview');
  const [stats,       setStats]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch((e) => {
        if (e.status === 401) { clearAdminSession(); navigate('/klaro-hub'); }
      });
  }, [navigate]);

  function logout() {
    clearAdminSession();
    navigate('/klaro-hub');
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-60 bg-[#1B4332] flex flex-col
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/assets/logos/logo.png" alt="Klaro" className="h-8 object-contain brightness-0 invert" />
            <div>
              <span className="block text-xs font-bold text-white/40 uppercase tracking-widest leading-none">Admin</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all relative text-left
                ${tab === item.id
                  ? 'bg-[#52B788] text-white shadow-sm'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'Applications' && stats?.pendingApplications > 0 && (
                <span className="ml-auto min-w-[20px] h-5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                  {stats.pendingApplications}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer — admin avatar + sign out */}
        <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#52B788] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-[#1B4332]">
                {getInitials(admin?.full_name, admin?.email, admin?.phone)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90 truncate leading-tight">
                {admin?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-white/40 truncate leading-tight">
                {admin?.email || admin?.phone || 'Administrator'}
              </p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors px-1 py-1 rounded-lg hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-[#1B4332] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/assets/logos/logo.png" alt="Klaro" className="h-6 object-contain brightness-0 invert" />
          <span className="flex-1 text-xs text-white/50 font-medium text-center">{tab}</span>
          <div className="w-7 h-7 rounded-full bg-[#52B788] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[#1B4332]">
              {getInitials(admin?.full_name, admin?.email, admin?.phone)}
            </span>
          </div>
        </header>

        {/* Page header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">{PAGE_TITLES[tab]?.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{PAGE_TITLES[tab]?.sub}</p>
        </div>

        {/* Tab content */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          {tab === 'Overview'      && <OverviewTab stats={stats} onTabChange={setTab} />}
          {tab === 'Users'         && <UsersTab />}
          {tab === 'Lawyers'       && <LawyersTab />}
          {tab === 'Applications'  && <LawyerApplicationsTab />}
          {tab === 'Audit Log'     && <AuditTab />}
          {tab === 'Templates'     && <TemplatesTab />}
          {tab === 'Security'      && <SecurityTab />}
        </main>
      </div>
    </div>
  );
}
