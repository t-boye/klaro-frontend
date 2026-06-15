import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { useLang } from '../context/LangContext';
import { getUser, clearSession } from '../lib/auth';

const COUNTRY_LABELS = {
  GH: 'Ghana', NG: 'Nigeria', ZA: 'South Africa', KE: 'Kenya', RW: 'Rwanda',
  CI: "Côte d'Ivoire", SN: 'Senegal', EG: 'Egypt', TZ: 'Tanzania',
};

const TYPE_ICON = {
  tenancy: '🏠', employment: '💼', nda: '🔒', freelance: '🖥️',
  loan: '💰', music: '🎵', partnership: '🤝', sales: '🛒', service: '⚙️', will: '📜',
};

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function BackBtn({ onClick, label = 'Back to templates' }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-5 transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

export default function Templates() {
  const { lang } = useLang();
  const navigate  = useNavigate();
  const user      = getUser();
  const plan      = user?.plan || 'trial';
  const isLocked  = plan === 'trial';
  const country   = user?.country || 'GH';

  const [view,           setView]           = useState('picker');
  const [types,          setTypes]          = useState([]);
  const [typesLoading,   setTypesLoading]   = useState(true);
  const [selectedType,   setSelectedType]   = useState(null);
  const [formValues,     setFormValues]     = useState({});
  const [generating,     setGenerating]     = useState(false);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState('');
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [upgradePrompt,  setUpgradePrompt]  = useState(isLocked);
  const [copied,         setCopied]         = useState(false);

  useEffect(() => { loadTypes(); }, []);

  async function loadTypes() {
    setTypesLoading(true);
    try {
      const data = await api.templates.listTypes();
      setTypes(data.types || []);
    } catch {}
    setTypesLoading(false);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await api.templates.listHistory();
      setHistory(data.templates || []);
    } catch {}
    setHistoryLoading(false);
  }

  function handleSelectType(type) {
    if (isLocked) { setUpgradePrompt(true); return; }
    setSelectedType(type);
    setFormValues({});
    setError('');
    setView('form');
  }

  async function handleGenerate() {
    setError('');
    setGenerating(true);
    try {
      const data = await api.templates.generate({
        type:      selectedType.key,
        form_data: formValues,
        country,
        language:  lang,
      });
      setResult(data);
      setView('result');
    } catch (e) {
      if (e.status === 403) {
        setUpgradePrompt(true);
        setView('picker');
      } else {
        setError(e.message || 'Failed to generate document. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  }

  async function loadHistoryItem(id) {
    try {
      const data = await api.templates.getById(id);
      setResult(data);
      setView('result');
    } catch {}
  }

  function handleCopy() {
    if (!result?.document) return;
    navigator.clipboard.writeText(result.document).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!result?.document) return;
    const blob = new Blob([result.document], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${(result.title || 'klaro-template').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleViewHistory() {
    setView('history');
    loadHistory();
  }

  const planNote = {
    individual:   '2 templates/month',
    pay_per_doc:  'charged per template',
    professional: 'unlimited',
    business:     'unlimited',
  }[plan] || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#1B4332] bg-[#1B4332]/10 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Template Builder
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">AI Document Templates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm max-w-md mx-auto">
            Generate legally sound contracts tailored to {COUNTRY_LABELS[country]} law. Pick a type, fill in the details, and download.
          </p>
          {planNote && (
            <p className="mt-1.5 text-xs text-[#1B4332] dark:text-[#52B788] font-medium">{planNote}</p>
          )}
        </div>

        {/* Upgrade banner */}
        {upgradePrompt && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-xl flex-shrink-0">🔐</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Upgrade to use Template Builder</p>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
                Available on Individual (2/mo), Professional, and Business plans.
              </p>
            </div>
            <Link to="/profile" className="flex-shrink-0 px-4 py-2 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#1B4332]/90 transition-colors whitespace-nowrap">
              Upgrade now
            </Link>
          </div>
        )}

        {/* Nav tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'picker',  label: 'Templates',    icon: '📋' },
            ...(result ? [{ key: 'result', label: 'Document', icon: '📄' }] : []),
            { key: 'history', label: 'My History',   icon: '🗂️' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => tab.key === 'history' ? handleViewHistory() : setView(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                view === tab.key
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PICKER ──────────────────────────────────────────────────────── */}
        {view === 'picker' && (
          <>
            {typesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {types.map(type => (
                  <button
                    key={type.key}
                    onClick={() => handleSelectType(type)}
                    className={`relative flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-[#52B788]/60 hover:shadow-md transition-all text-center group ${
                      isLocked ? 'opacity-70' : ''
                    }`}
                  >
                    {isLocked && (
                      <span className="absolute top-2 right-2 text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                    )}
                    <span className="text-3xl group-hover:scale-110 transition-transform">{type.icon}</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
              Templates are drafted based on {COUNTRY_LABELS[country]} law · Not legal advice — always have a lawyer review before signing
            </p>
          </>
        )}

        {/* ── FORM ────────────────────────────────────────────────────────── */}
        {view === 'form' && selectedType && (
          <div>
            <BackBtn onClick={() => setView('picker')} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                <span className="text-3xl">{selectedType.icon}</span>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">{selectedType.label}</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Fields marked <span className="text-red-400">*</span> are required</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedType.fields.map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formValues[field.key] || ''}
                        onChange={e => setFormValues(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={`Enter ${field.label.toLowerCase()}…`}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#1B4332]/30 focus:border-[#1B4332] outline-none resize-none transition-colors"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formValues[field.key] || ''}
                        onChange={e => setFormValues(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.type === 'number' ? '0' : field.type === 'date' ? '' : `Enter ${field.label.toLowerCase()}…`}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#1B4332]/30 focus:border-[#1B4332] outline-none transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-6 w-full py-3.5 bg-[#1B4332] text-white font-semibold rounded-xl hover:bg-[#1B4332]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {generating ? (
                  <>
                    <Spinner />
                    Generating your document…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate {selectedType.label}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                AI-drafted · Tailored to {COUNTRY_LABELS[country]} law · Not legal advice
              </p>
            </div>
          </div>
        )}

        {/* ── RESULT ──────────────────────────────────────────────────────── */}
        {view === 'result' && result && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <BackBtn onClick={() => setView('picker')} label="New template" />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#1B4332] text-white rounded-xl hover:bg-[#1B4332]/90 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download .txt
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <span className="text-2xl">{TYPE_ICON[result.templateType] || '📄'}</span>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">{result.title}</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {COUNTRY_LABELS[result.country] || result.country}
                    {result.createdAt ? ` · ${new Date(result.createdAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
                  Generated
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed overflow-auto max-h-[65vh]">
                {result.document}
              </pre>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              AI-generated. Have it reviewed by a qualified lawyer in {COUNTRY_LABELS[result.country] || 'your country'} before signing.
            </p>
          </div>
        )}

        {/* ── HISTORY ─────────────────────────────────────────────────────── */}
        {view === 'history' && (
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">My Generated Documents</h2>

            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-5xl mb-3 opacity-30">📄</div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No documents yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Generate your first document and it will appear here.
                </p>
                <button
                  onClick={() => setView('picker')}
                  className="mt-5 px-5 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#1B4332]/90 transition-colors"
                >
                  Browse templates
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item.id)}
                    className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-[#52B788]/50 hover:shadow-sm transition-all text-left group"
                  >
                    <span className="text-xl flex-shrink-0">{TYPE_ICON[item.templateType] || '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {COUNTRY_LABELS[item.country] || item.country} · {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
