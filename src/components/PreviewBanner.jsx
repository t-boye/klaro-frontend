import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../lib/auth';

const PREVIEW_KEY = 'klaro_preview';

export function getPreviewInfo() {
  try { return JSON.parse(sessionStorage.getItem(PREVIEW_KEY) || 'null'); }
  catch { return null; }
}

export function startPreview(token, user) {
  // Persist who we're previewing so the banner can show it
  sessionStorage.setItem(PREVIEW_KEY, JSON.stringify({
    name:  user.full_name || user.email || user.phone || 'User',
    plan:  user.plan,
    email: user.email || user.phone || '',
  }));

  // Drop a temporary user session into localStorage
  // (admin session lives under different keys and is untouched)
  localStorage.setItem('klaro_token', token);
  localStorage.setItem('klaro_user',  JSON.stringify({
    ...user,
    // mark as preview so nothing destructive runs
    _preview: true,
  }));
}

export function exitPreview() {
  sessionStorage.removeItem(PREVIEW_KEY);
  clearSession(); // removes klaro_token + klaro_user
}

// ─── Banner component ─────────────────────────────────────────────────────────

const PLAN_COLORS = {
  trial:        'bg-gray-600',
  pay_per_doc:  'bg-blue-600',
  individual:   'bg-cyan-600',
  professional: 'bg-[#1B4332]',
  business:     'bg-purple-700',
};

export default function PreviewBanner() {
  const navigate = useNavigate();
  const preview  = getPreviewInfo();
  if (!preview) return null;

  function handleExit() {
    exitPreview();
    navigate('/admin/dashboard');
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-2 bg-amber-500 text-white text-sm shadow-lg">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Eye icon */}
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="font-semibold flex-shrink-0">Admin Preview</span>
        <span className="hidden sm:inline text-amber-100">—</span>
        <span className="text-amber-100 truncate hidden sm:block">
          Viewing as <strong className="text-white">{preview.name}</strong>
          {preview.email ? ` (${preview.email})` : ''}
        </span>
        {preview.plan && (
          <span className={`hidden sm:inline text-xs font-bold px-2 py-0.5 rounded-full text-white ${PLAN_COLORS[preview.plan] || 'bg-gray-600'}`}>
            {preview.plan}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-amber-200 hidden md:block">Token expires in 15 min</span>
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-amber-600 hover:bg-amber-50 transition-colors whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit Preview
        </button>
      </div>
    </div>
  );
}
