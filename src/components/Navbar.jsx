import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUser } from '../lib/auth';
import ThemeToggle from './ThemeToggle';
import AvatarIcon from './AvatarIcon';

const PLAN_BADGE = {
  trial:        { label: 'Trial', bg: '#6B7280', text: '#fff' },
  pay_per_doc:  { label: 'PPD',   bg: '#2563EB', text: '#fff' },
  individual:   { label: 'Solo',  bg: '#0891B2', text: '#fff' },
  professional: { label: 'Pro',   bg: '#1B4332', text: '#52B788' },
  business:     { label: 'Biz',   bg: '#6D28D9', text: '#fff' },
};

function NavItem({ to, children, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-150 relative
        ${active
          ? 'text-brand-600 dark:text-brand-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      style={{
        borderBottom: active ? '2px solid #1B4332' : '2px solid transparent',
        borderRadius: 0,
      }}
    >
      {children}
    </Link>
  );
}

export default function Navbar({ onLogout, wide = false }) {
  const user      = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const plan      = user?.plan || 'trial';
  const badge     = PLAN_BADGE[plan] || PLAN_BADGE.trial;
  const avatarId  = user?.avatar || 'male1';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
      <div className={`${wide ? 'max-w-5xl' : 'max-w-2xl'} mx-auto px-4 py-2 flex items-center justify-between gap-3`}>

        {/* Logo */}
        <Link to="/dashboard" className="flex-shrink-0">
          <img src="/assets/logos/logo.png" alt="Klaro" className="h-12 object-contain" />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/upload">Analyse</NavItem>
          <NavItem to="/chat">Legal Chat</NavItem>
          <NavItem to="/lawyers">Lawyers</NavItem>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Avatar with plan indicator dot */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <AvatarIcon avatarId={avatarId} size={32} />
                </div>
                {/* Small colored dot — plan indicator */}
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                  style={{ background: badge.bg, border: '2px solid #fff' }}
                />
              </div>
              <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-52 py-1.5 overflow-hidden">

                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <AvatarIcon avatarId={avatarId} size={40} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {user?.full_name || 'My account'}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs truncate mt-0.5">
                          {user?.email || user?.phone}
                        </p>
                      </div>
                    </div>
                    {/* Plan pill */}
                    <span
                      className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {badge.label} plan
                    </span>
                  </div>

                  <div className="py-1">
                    <NavItem to="/" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Home
                    </NavItem>
                    <NavItem to="/dashboard" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </NavItem>
                    <NavItem to="/upload" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Analyse document
                    </NavItem>
                    <NavItem to="/chat" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Legal Chat
                    </NavItem>
                    <NavItem to="/lawyers" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      Find a lawyer
                    </NavItem>
                    <NavItem to="/profile" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile & settings
                    </NavItem>
                  </div>

                  <div className="border-t border-gray-50 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={() => { setMenuOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mx-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
