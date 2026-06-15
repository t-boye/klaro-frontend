import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUser } from '../lib/auth';
import ThemeToggle from './ThemeToggle';
import AvatarIcon from './AvatarIcon';
import { useLang } from '../context/LangContext';

// ─── Plan config ─────────────────────────────────────────────────────────────

const PLAN_BADGE = {
  trial:        { label: 'Trial',        bg: '#6B7280', text: '#fff' },
  pay_per_doc:  { label: 'Pay Per Doc',  bg: '#2563EB', text: '#fff' },
  individual:   { label: 'Individual',   bg: '#0891B2', text: '#fff' },
  professional: { label: 'Pro',          bg: '#1B4332', text: '#52B788' },
  business:     { label: 'Business',     bg: '#6D28D9', text: '#fff' },
};

// ─── Desktop nav pill ────────────────────────────────────────────────────────

function NavPill({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap
        ${active
          ? 'bg-[#1B4332] text-white shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      {children}
    </Link>
  );
}

// ─── Mobile bottom tab ───────────────────────────────────────────────────────

function BottomTab({ to, label, icon, onClick }) {
  const { pathname } = useLocation();
  const active = to ? pathname === to : false;
  const Tag = to ? Link : 'button';
  return (
    <Tag
      {...(to ? { to } : {})}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2 min-w-0"
    >
      <span className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-150
        ${active ? 'bg-[#1B4332]/10 dark:bg-[#52B788]/15' : ''}`}>
        <span className={`transition-colors duration-150 ${active ? 'text-[#1B4332] dark:text-[#52B788]' : 'text-gray-400 dark:text-gray-500'}`}>
          {icon}
        </span>
      </span>
      <span className={`text-[10px] font-semibold leading-none truncate transition-colors duration-150
        ${active ? 'text-[#1B4332] dark:text-[#52B788]' : 'text-gray-400 dark:text-gray-500'}`}>
        {label}
      </span>
    </Tag>
  );
}

// ─── Dropdown nav row ────────────────────────────────────────────────────────

function MenuRow({ to, icon, label, onClick, danger = false }) {
  const { pathname } = useLocation();
  const active = to && pathname === to;
  const Tag = to ? Link : 'button';
  return (
    <Tag
      {...(to ? { to } : {})}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 mx-0 rounded-xl text-sm font-medium transition-colors
        ${danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          : active
            ? 'bg-[#1B4332]/[0.07] dark:bg-[#52B788]/10 text-[#1B4332] dark:text-[#52B788]'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <span className={`flex-shrink-0 ${
        danger ? 'text-red-400' : active ? 'text-[#1B4332] dark:text-[#52B788]' : 'text-gray-400 dark:text-gray-500'
      }`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {active && !danger && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] dark:bg-[#52B788] flex-shrink-0" />
      )}
    </Tag>
  );
}

// ─── Icons (inline, no import overhead) ──────────────────────────────────────

const Icon = {
  grid:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
  doc:       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  chat:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  book:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  template:  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  lawyer:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  user:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  home:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>,
  logout:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  globe:     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
  moon:      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  more:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  chevron:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>,
  info:      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={1.8} strokeLinecap="round"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth={1.8} strokeLinecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={1.8} strokeLinecap="round"/></svg>,
};

// ─── Main Navbar ─────────────────────────────────────────────────────────────

export default function Navbar({ onLogout }) {
  const user  = getUser();
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const plan     = user?.plan || 'trial';
  const badge    = PLAN_BADGE[plan] || PLAN_BADGE.trial;
  const avatarId = user?.avatar || 'male1';

  function close() { setOpen(false); }

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/dashboard" className="flex-shrink-0 flex items-center">
            <img src="/assets/logos/logo.png" alt="Klaro" className="h-8 object-contain" />
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <NavPill to="/dashboard">{t('nav.dashboard')}</NavPill>
            <NavPill to="/upload">{t('nav.analyse')}</NavPill>
            <NavPill to="/chat">{t('nav.chat')}</NavPill>
            <NavPill to="/library">{t('nav.library')}</NavPill>
            <NavPill to="/templates">{t('nav.templates')}</NavPill>
            <NavPill to="/lawyers">{t('nav.lawyers')}</NavPill>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme toggle — visible everywhere */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Avatar trigger */}
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 shadow-sm"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <AvatarIcon avatarId={avatarId} size={28} />
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800"
                  style={{ background: badge.bg }}
                />
              </div>
              {/* Name — desktop only */}
              <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[88px] truncate leading-none">
                {user?.full_name?.split(' ')[0] || 'Account'}
              </span>
              <span
                className="transition-transform duration-200 text-gray-400 dark:text-gray-500"
                style={{ transform: open ? 'rotate(180deg)' : 'none', display: 'block' }}
              >
                {Icon.chevron}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Account dropdown ─────────────────────────────────────────────── */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="fixed right-4 top-[60px] z-50 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
               style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>

            {/* User card */}
            <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-[#1B4332]/[0.06] to-[#52B788]/[0.04] dark:from-[#1B4332]/40 dark:to-[#52B788]/10 border-b border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-[#52B788]/25 flex-shrink-0">
                  <AvatarIcon avatarId={avatarId} size={48} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug truncate">
                    {user?.full_name || 'My Account'}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs truncate mt-0.5 leading-snug">
                    {user?.email || user?.phone}
                  </p>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: badge.bg, color: badge.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {badge.label} plan
              </span>
            </div>

            {/* Navigation — shown in dropdown for mobile, secondary on desktop */}
            <div className="p-2">
              <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Menu
              </p>
              <div className="space-y-0.5">
                <MenuRow to="/dashboard" icon={Icon.grid}     label={t('nav.dashboard')}     onClick={close} />
                <MenuRow to="/upload"    icon={Icon.doc}      label={t('nav.analyseDoc')}    onClick={close} />
                <MenuRow to="/chat"      icon={Icon.chat}     label={t('nav.chat')}          onClick={close} />
                <MenuRow to="/library"   icon={Icon.book}     label={t('nav.lawLibrary')}    onClick={close} />
                <MenuRow to="/templates" icon={Icon.template} label={t('nav.templateBuilder')} onClick={close} />
                <MenuRow to="/lawyers"   icon={Icon.lawyer}   label={t('nav.findLawyer')}    onClick={close} />
                <MenuRow to="/profile"   icon={Icon.user}     label={t('nav.profile')}       onClick={close} />
                <MenuRow to="/about"     icon={Icon.info}     label="About Klaro"            onClick={close} />
              </div>
            </div>

            {/* Preferences */}
            <div className="border-t border-gray-100 dark:border-gray-700/60 p-2">
              <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Preferences
              </p>

              {/* Language */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  {Icon.globe}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Language</span>
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 gap-0.5">
                  {[{ code: 'en', iso: 'gb', label: 'EN' }, { code: 'fr', iso: 'fr', label: 'FR' }].map(({ code, iso, label }) => (
                    <button
                      key={code}
                      onClick={() => setLang(code)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                        lang === code
                          ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
                      }`}
                    >
                      <img src={`https://flagcdn.com/20x15/${iso}.png`} width="18" height="13" alt={label} className="rounded-sm" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appearance */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  {Icon.moon}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Appearance</span>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Sign out */}
            <div className="border-t border-gray-100 dark:border-gray-700/60 p-2">
              <MenuRow icon={Icon.logout} label={t('nav.logOut')} onClick={() => { close(); onLogout(); }} danger />
            </div>

          </div>
        </>
      )}

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center h-14 px-2">
          <BottomTab to="/dashboard" label={t('nav.dashboard')} icon={Icon.grid} />
          <BottomTab to="/upload"    label={t('nav.analyse')}   icon={Icon.doc} />
          <BottomTab to="/chat"      label={t('nav.chat')}      icon={Icon.chat} />
          <BottomTab to="/library"   label={t('nav.library')}   icon={Icon.book} />
          <BottomTab
            label="More"
            icon={Icon.more}
            onClick={() => setOpen(o => !o)}
          />
        </div>
      </div>

    </>
  );
}
