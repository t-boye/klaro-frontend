import React, { useState } from 'react';

const RATING_CONFIG = {
  GREEN:  { dot: 'bg-green-500',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'STANDARD',      textColor: 'text-green-700'  },
  YELLOW: { dot: 'bg-yellow-400', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'ATTENTION',     textColor: 'text-yellow-700' },
  RED:    { dot: 'bg-red-500',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'DANGER',        textColor: 'text-red-700'    },
  BLUE:   { dot: 'bg-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'YOUR RIGHTS',   textColor: 'text-blue-700'   },
  GREY:   { dot: 'bg-gray-300',   bg: 'bg-gray-50',   border: 'border-gray-200',   label: 'STANDARD LEGAL', textColor: 'text-gray-500'  },
};

export default function ClauseCard({ clause, lang }) {
  const [open, setOpen] = useState(clause.rating === 'RED' || clause.rating === 'YELLOW');
  const cfg = RATING_CONFIG[clause.rating] || RATING_CONFIG.GREY;

  const explanation = lang === 'tw' && clause.twi ? clause.twi : clause.plainEnglish;

  return (
    <div className={`rounded-xl border ${cfg.border} overflow-hidden`}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${cfg.bg}`}
      >
        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`text-xs font-bold flex-shrink-0 ${cfg.textColor}`}>{cfg.label}</span>
        <span className="text-sm text-gray-700 truncate flex-1">{explanation}</span>
        <span className="text-gray-400 flex-shrink-0 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 py-4 border-t border-gray-100 bg-white space-y-3">
          {/* Plain explanation */}
          <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>

          {/* Original text */}
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-600">Show original clause text</summary>
            <blockquote className="mt-2 pl-3 border-l-2 border-gray-200 text-gray-500 italic leading-relaxed">
              {clause.originalText}
            </blockquote>
          </details>

          {/* Why flagged */}
          {clause.whyFlagged && (
            <div className={`rounded-lg px-3 py-2 text-xs ${cfg.bg} ${cfg.textColor}`}>
              <p className="font-semibold mb-0.5">Why this was flagged</p>
              <p>{clause.whyFlagged}</p>
            </div>
          )}

          {/* Ghana context */}
          {clause.ghanaContext && (
            <div className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
              <p className="font-semibold mb-0.5">In Ghana</p>
              <p>{clause.ghanaContext}</p>
            </div>
          )}

          {/* Suggested question */}
          {clause.suggestedQuestion && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700">
              <p className="font-semibold mb-0.5">Ask the other party</p>
              <p className="italic">"{clause.suggestedQuestion}"</p>
            </div>
          )}

          {/* Relevant law */}
          {clause.relevantLaw && (
            <p className="text-xs text-gray-400">
              <span className="font-medium">Ghana law: </span>{clause.relevantLaw}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
