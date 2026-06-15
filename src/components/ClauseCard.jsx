import React, { useState } from 'react';

const RATING_CONFIG = {
  GREEN:  { strip: '#22c55e', labelBg: '#f0fdf4', labelBorder: '#bbf7d0', labelText: '#16a34a', label: 'STANDARD',    icon: '🟢' },
  YELLOW: { strip: '#f59e0b', labelBg: '#fffbeb', labelBorder: '#fde68a', labelText: '#b45309', label: 'ATTENTION',   icon: '🟡' },
  RED:    { strip: '#ef4444', labelBg: '#fef2f2', labelBorder: '#fecaca', labelText: '#dc2626', label: 'DANGER',      icon: '🔴' },
  BLUE:   { strip: '#3b82f6', labelBg: '#eff6ff', labelBorder: '#bfdbfe', labelText: '#2563eb', label: 'YOUR RIGHTS', icon: '🔵' },
  GREY:   { strip: '#9ca3af', labelBg: '#f9fafb', labelBorder: '#e5e7eb', labelText: '#6b7280', label: 'BOILERPLATE', icon: '⚫' },
};

function SpeakerIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  );
}

export default function ClauseCard({ clause, lang, onSpeak, isActive }) {
  const [open, setOpen] = useState(clause.rating === 'RED' || clause.rating === 'YELLOW');
  const cfg = RATING_CONFIG[clause.rating] || RATING_CONFIG.GREY;

  const localText   = clause.localLanguage || clause.twi;
  const explanation = (lang && lang !== 'en' && localText) ? localText : clause.plainEnglish;

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden flex transition-all duration-200 ${
      isActive
        ? 'border-[#52B788] ring-2 ring-[#52B788]/30 dark:ring-[#52B788]/20'
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Left color strip */}
      <div className="w-1 flex-shrink-0" style={{ background: cfg.strip }} />

      <div className="flex-1 min-w-0">
        {/* Header row — two sibling buttons: expand + speaker */}
        <div className={`flex items-center transition-colors ${open ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}>

          {/* Expand / collapse button */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 text-left"
          >
            <span
              className="text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full border"
              style={{ background: cfg.labelBg, color: cfg.labelText, borderColor: cfg.labelBorder }}
            >
              {cfg.label}
            </span>

            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 leading-snug">
              {explanation}
            </span>

            <svg
              className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Speaker button — only rendered when voice is available */}
          {onSpeak && (
            <button
              type="button"
              onClick={onSpeak}
              title="Listen to this clause"
              className={`flex-shrink-0 px-3 py-3.5 transition-colors ${
                isActive
                  ? 'text-[#52B788]'
                  : 'text-gray-300 dark:text-gray-600 hover:text-[#52B788] dark:hover:text-[#52B788]'
              }`}
            >
              <SpeakerIcon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>

        {/* Expanded detail */}
        {open && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700 space-y-3 bg-white dark:bg-gray-800">

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{explanation}</p>

            {clause.whyFlagged && (
              <div
                className="rounded-lg px-3 py-2.5 text-xs leading-relaxed"
                style={{ background: cfg.labelBg, color: cfg.labelText, border: `1px solid ${cfg.labelBorder}` }}
              >
                <p className="font-bold mb-0.5">Why this was flagged</p>
                <p>{clause.whyFlagged}</p>
              </div>
            )}

            {(clause.countryContext || clause.ghanaContext) && (
              <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 px-3 py-2.5 text-xs text-brand-700 dark:text-brand-400 leading-relaxed">
                <p className="font-bold mb-0.5">Local law context</p>
                <p>{clause.countryContext || clause.ghanaContext}</p>
              </div>
            )}

            {clause.suggestedQuestion && (
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="font-bold mb-0.5">Ask the other party</p>
                <p className="italic">"{clause.suggestedQuestion}"</p>
              </div>
            )}

            {clause.relevantLaw && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <span className="font-semibold">Relevant law: </span>{clause.relevantLaw}
              </p>
            )}

            <details className="text-xs">
              <summary className="cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 select-none">
                Show original clause text
              </summary>
              <blockquote className="mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 italic leading-relaxed">
                {clause.originalText}
              </blockquote>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
