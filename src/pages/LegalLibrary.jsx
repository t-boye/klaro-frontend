import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import UpgradeModal from '../components/UpgradeModal';
import { clearSession, getUser } from '../lib/auth';
import { useLang } from '../context/LangContext';

const COUNTRIES = [
  { code: 'GH', name: 'Ghana',         flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria',        flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa',   flag: '🇿🇦' },
  { code: 'KE', name: 'Kenya',          flag: '🇰🇪' },
  { code: 'RW', name: 'Rwanda',         flag: '🇷🇼' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal',        flag: '🇸🇳' },
  { code: 'EG', name: 'Egypt',          flag: '🇪🇬' },
  { code: 'TZ', name: 'Tanzania',       flag: '🇹🇿' },
];

const CATEGORIES = [
  { field: 'music',      icon: '🎵', label: 'Music & Entertainment', desc: 'Copyright, royalties, contracts' },
  { field: 'employment', icon: '💼', label: 'Employment & Labour',   desc: 'Rights, notice, wages' },
  { field: 'property',   icon: '🏠', label: 'Property & Land',       desc: 'Title, tenancy, land rights' },
  { field: 'finance',    icon: '💰', label: 'Loans & Finance',        desc: 'Borrowing, interest, lenders' },
  { field: 'business',   icon: '🏢', label: 'Business & Companies',   desc: 'Registration, NDAs, directors' },
  { field: 'family',     icon: '👨‍👩‍👧', label: 'Family & Marriage',     desc: 'Divorce, custody, inheritance' },
  { field: 'consumer',   icon: '🛍️', label: 'Consumer Rights',        desc: 'Refunds, warranties, scams' },
  { field: 'digital',    icon: '📱', label: 'Digital & Privacy',      desc: 'Data rights, online contracts' },
  { field: 'transport',  icon: '🚗', label: 'Road & Transport',       desc: 'Accidents, insurance, licences' },
  { field: 'healthcare', icon: '🏥', label: 'Healthcare Rights',      desc: 'Consent, negligence, access' },
];

function ChevronDown({ open }) {
  return (
    <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function LegalLibrary() {
  const navigate    = useNavigate();
  const currentUser = getUser();
  const { t }       = useLang();
  const country = currentUser?.country || 'GH';
  const [selectedField, setSelectedField] = useState(null);
  const [guide,         setGuide]         = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [openSection,   setOpenSection]   = useState(0);
  const [showUpgrade,   setShowUpgrade]   = useState(false);

  async function loadGuide(field) {
    if (selectedField === field && guide) {
      document.getElementById('guide-panel')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setSelectedField(field);
    setGuide(null);
    setError('');
    setLoading(true);
    setOpenSection(0);
    try {
      const data = await api.legalLibrary(field, country);
      setGuide(data);
      setTimeout(() => document.getElementById('guide-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      if (e.status === 403) {
        setSelectedField(null);
        setShowUpgrade(true);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function downloadGuide() {
    if (!guide) return;
    const logoUrl = `${window.location.origin}/assets/logos/logo.png`;
    const dateStr = new Date(guide.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const sectionsHtml = guide.sections.map(s => `
      <div class="section">
        <h2>${s.heading}</h2>
        <p>${s.content.replace(/\n/g, '<br/>')}</p>
        ${s.acts?.length ? `<div class="acts"><span class="acts-label">Relevant legislation:</span> ${s.acts.join(' · ')}</div>` : ''}
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Klaro Law Library — ${guide.fieldLabel} in ${guide.countryName}</title>
<style>
  @page { margin: 20mm 18mm; }
  body { font-family: Georgia, serif; font-size: 11pt; color: #111; line-height: 1.65; margin: 0; }
  .watermark {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-45deg);
    font-size: 92pt; font-weight: 900; color: #1B4332; opacity: 0.04;
    pointer-events: none; z-index: 0; white-space: nowrap; font-family: Arial, sans-serif;
  }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1B4332; padding-bottom: 12px; margin-bottom: 8px; }
  .header img { height: 44px; object-fit: contain; }
  .header-right { text-align: right; font-size: 9pt; color: #555; }
  .title-block { margin-bottom: 24px; }
  .title-block h1 { font-size: 18pt; color: #1B4332; margin: 12px 0 4px; }
  .title-block .meta { font-size: 9pt; color: #888; }
  h2 { font-size: 13pt; color: #1B4332; border-left: 3px solid #52B788; padding-left: 10px; margin: 24px 0 8px; }
  p { margin: 0 0 10px; }
  .acts { background: #f0f7f4; border: 1px solid #c3e0d4; border-radius: 6px; padding: 8px 12px; font-size: 9pt; color: #1B4332; margin-top: 10px; }
  .acts-label { font-weight: bold; }
  .section { page-break-inside: avoid; }
  .disclaimer { border-top: 1px solid #ddd; margin-top: 32px; padding-top: 12px; font-size: 8.5pt; color: #888; font-style: italic; }
  .footer { text-align: center; font-size: 8pt; color: #aaa; margin-top: 20px; }
  @media print { .watermark { position: fixed; } }
</style>
</head>
<body>
<div class="watermark">KLARO</div>
<div class="header">
  <img src="${logoUrl}" alt="Klaro" onerror="this.style.display='none'"/>
  <div class="header-right">
    <strong>Klaro Legal AI</strong><br/>
    Law Library — Confidential<br/>
    ${dateStr}
  </div>
</div>
<div class="title-block">
  <h1>${guide.fieldLabel} Law — ${guide.countryName}</h1>
  <div class="meta">Klaro Legal Guide · Researched with live law sources · ${dateStr}</div>
</div>
${sectionsHtml}
<div class="disclaimer">
  This guide is for informational purposes only and does not constitute legal advice.
  Laws change — always verify with a qualified lawyer in ${guide.countryName}.
</div>
<div class="footer">klaro.app · Africa's AI Legal Document Explainer</div>
<script>window.onload=function(){window.print();}<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  const countryInfo = COUNTRIES.find(c => c.code === country);
  const selectedCat = CATEGORIES.find(c => c.field === selectedField);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} wide />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Page header — desktop only */}
      <div className="hidden sm:block bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-base">📚</div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">{t('library.badge')}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{t('library.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('library.subtitle').replace('{country}', countryInfo?.name || '')}
            </p>
          </div>
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full">
              <span>{countryInfo?.flag}</span>
              <span>{countryInfo?.name}</span>
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <span className="text-gray-400 dark:text-gray-500">Change in Profile</span>
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-5 py-3 sm:py-6">

        {/* Mobile: 2-column compact grid */}
        <div className="sm:hidden grid grid-cols-2 gap-2 mb-3">
          {CATEGORIES.map(cat => {
            const isActive = selectedField === cat.field;
            return (
              <button
                key={cat.field}
                onClick={() => loadGuide(cat.field)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-[#1B4332] border-[#1B4332] text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg leading-none flex-shrink-0">{cat.icon}</span>
                <span className="text-xs font-semibold truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop: category grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {CATEGORIES.map(cat => {
            const isActive = selectedField === cat.field;
            return (
              <button
                key={cat.field}
                onClick={() => loadGuide(cat.field)}
                className={`group p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200 dark:shadow-brand-900/30'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-2 leading-none">{cat.icon}</div>
                <p className={`text-xs font-bold leading-tight mb-1 ${isActive ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                  {cat.label}
                </p>
                <p className={`text-xs leading-tight ${isActive ? 'text-brand-100' : 'text-gray-400 dark:text-gray-500'}`}>
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Guide panel */}
        {selectedField && (
          <div id="guide-panel" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Guide header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg sm:text-xl flex-shrink-0">{selectedCat?.icon}</span>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white leading-tight">{selectedCat?.label}</h2>
                  {guide && !loading && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate hidden sm:block">
                      {guide.countryName} · Researched with live law sources · {new Date(guide.generatedAt).toLocaleDateString('en-GB')}
                    </p>
                  )}
                  {loading && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                      {t('library.loadingHeader').replace('{country}', countryInfo?.name || '')}
                    </p>
                  )}
                </div>
              </div>

              {guide && !loading && (
                <button
                  onClick={downloadGuide}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">{t('library.downloadPdf')}</span>
                </button>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="px-6 py-16 flex flex-col items-center justify-center text-center gap-4">
                <div className="relative">
                  <Spinner className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('library.loading')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t('library.loadingDesc').replace('{country}', countryInfo?.name || '')}
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="px-6 py-10 text-center">
                <p className="text-2xl mb-2">⚠️</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('library.error')}</p>
                <p className="text-xs text-gray-400 mb-4">{error}</p>
                <button onClick={() => loadGuide(selectedField)} className="btn-primary text-sm">{t('library.tryAgain')}</button>
              </div>
            )}

            {/* Accordion sections */}
            {!loading && !error && guide && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {guide.sections.map((section, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenSection(openSection === i ? null : i)}
                      className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{section.heading}</span>
                      <ChevronDown open={openSection === i} />
                    </button>
                    {openSection === i && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </p>
                        {section.acts?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t('library.relevantLeg')}</p>
                            <div className="flex flex-wrap gap-2">
                              {section.acts.map((act, j) => (
                                <span key={j} className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700 rounded-full px-3 py-1 font-medium">
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Disclaimer footer */}
            {!loading && guide && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  {t('library.disclaimer').replace('{country}', guide.countryName)}
                </p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
