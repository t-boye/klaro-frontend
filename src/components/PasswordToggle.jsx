import React, { useState } from 'react';

export default function PasswordToggle({ show, onToggle }) {
  const [bursting, setBursting] = useState(false);

  function handleClick() {
    setBursting(true);
    setTimeout(() => setBursting(false), 380);
    onToggle();
  }

  return (
    <>
      <style>{`
        @keyframes lock-pop {
          0%   { transform: scale(1) rotate(0deg); }
          25%  { transform: scale(0.8) rotate(-8deg); }
          60%  { transform: scale(1.2) rotate(4deg); }
          80%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .lock-pop { animation: lock-pop 0.38s cubic-bezier(0.34,1.56,0.64,1) both; }

        @keyframes shackle-open {
          0%   { d: path("M8 11V7a4 4 0 0 1 8 0v4"); }
          100% { d: path("M8 11V7a4 4 0 0 1 7.75-1.35"); }
        }
      `}</style>

      <button
        type="button"
        onClick={handleClick}
        title={show ? 'Lock password' : 'Reveal password'}
        className={`
          absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
          transition-colors duration-200
          ${show
            ? 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
      >
        <span className={bursting ? 'lock-pop' : ''} style={{ display: 'block' }}>
          {show ? <UnlockIcon /> : <LockIcon />}
        </span>
      </button>
    </>
  );
}

function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Shackle — closed, symmetric */}
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      {/* Lock body */}
      <rect x="4" y="11" width="16" height="11" rx="2" />
      {/* Keyhole circle */}
      <circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Shackle — open on the right side, lifted */}
      <path d="M8 11V6a4 4 0 0 1 7.75-1.4" />
      {/* Lock body */}
      <rect x="4" y="11" width="16" height="11" rx="2" />
      {/* Keyhole — open state shows a small slit */}
      <circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" />
      <line x1="12" y1="18.2" x2="12" y2="20" strokeWidth="1.5" />
    </svg>
  );
}
