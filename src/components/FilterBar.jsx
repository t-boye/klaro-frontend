import React from 'react';

const FILTERS = [
  { key: 'ALL',    label: 'All',           dot: 'bg-gray-400' },
  { key: 'RED',    label: 'Danger',        dot: 'bg-red-500'  },
  { key: 'YELLOW', label: 'Attention',     dot: 'bg-yellow-400' },
  { key: 'GREEN',  label: 'Standard',      dot: 'bg-green-500' },
  { key: 'BLUE',   label: 'Your rights',   dot: 'bg-blue-500'  },
  { key: 'GREY',   label: 'Boilerplate',   dot: 'bg-gray-300'  },
];

export default function FilterBar({ active, onChange, counts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {FILTERS.map(({ key, label, dot }) => {
        const count = key === 'ALL' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[key] || 0);
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
              ${active === key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
            {count > 0 && <span className="opacity-70">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
