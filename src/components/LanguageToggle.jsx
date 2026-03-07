import React from 'react';

const LANGS = [
  { v: 'en',  l: 'EN' },
  { v: 'tw',  l: 'TWI' },
  { v: 'ga',  l: 'GA' },
  { v: 'ewe', l: 'EWE' },
  { v: 'dag', l: 'DAG' },
  { v: 'ha',  l: 'HAUSA' },
  { v: 'fan', l: 'FANTE' },
];

export default function LanguageToggle({ lang, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {LANGS.map(({ v, l }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
            lang === v
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
