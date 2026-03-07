import React from 'react';

const CONFIG = {
  HIGH:   { label: 'HIGH RISK',          className: 'bg-red-100 text-red-700 border border-red-200' },
  MEDIUM: { label: 'REVIEW RECOMMENDED', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  LOW:    { label: 'STANDARD',           className: 'bg-green-100 text-green-700 border border-green-200' },
};

export default function RiskBadge({ risk, large = false }) {
  const cfg = CONFIG[risk] || { label: risk || 'UNKNOWN', className: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-block font-bold rounded-lg px-3 ${large ? 'py-2 text-base' : 'py-1 text-xs'} ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
