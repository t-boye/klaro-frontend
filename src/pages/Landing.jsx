import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../lib/auth';
import ThemeToggle from '../components/ThemeToggle';
import { useLang } from '../context/LangContext';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DOCS = [
  { name: 'Employment_Contract.pdf', type: 'Employment Contract', date: 'Jun 2, 2026', strip: '#1B4332' },
  { name: 'Tenancy_Agreement.pdf',   type: 'Tenancy Agreement',   date: 'Jun 1, 2026', strip: '#52B788' },
  { name: 'NDA_Agreement.pdf',       type: 'Non-Disclosure',      date: 'May 28, 2026', strip: '#6b7280' },
];

const MOCK_CLAUSES = [
  { text: 'Employee agrees to a 36-month non-compete clause covering all of Africa.',   label: 'DANGER',     explanation: 'Non-compete over 24 months is extreme and likely unenforceable in most African jurisdictions.', color: '#ef4444', lightBg: '#fef2f2', lightBorder: '#fecaca', lightText: '#dc2626' },
  { text: 'Employee is entitled to 15 working days of annual leave per calendar year.', label: 'YOUR RIGHTS', explanation: 'Meets minimum leave requirements in most African labour laws. This clause protects you.',           color: '#3b82f6', lightBg: '#eff6ff', lightBorder: '#bfdbfe', lightText: '#2563eb' },
  { text: 'Employer may terminate employment at any time without notice or reason.',    label: 'DANGER',     explanation: 'Labour laws across Africa require minimum notice periods. This clause waives your rights.',         color: '#ef4444', lightBg: '#fef2f2', lightBorder: '#fecaca', lightText: '#dc2626' },
  { text: 'Monthly salary payable on the last working day of each month.',              label: 'STANDARD',   explanation: 'Clear salary terms with standard payment schedule. Nothing unusual here.',                        color: '#22c55e', lightBg: '#f0fdf4', lightBorder: '#bbf7d0', lightText: '#16a34a' },
];

const MOCK_CHAT = [
  { role: 'user', text: 'Can my landlord evict me without notice in Ghana?' },
  { role: 'ai',   text: "No. Under Ghana's Rent Act (Act 220), a landlord must give at least one month's written notice before eviction. Verbal-only notices are not legally binding." },
];

const MOCK_LIB_CATS = [
  { icon: '🎵', label: 'Music & IP' },  { icon: '💼', label: 'Employment' },
  { icon: '🏠', label: 'Property' },    { icon: '💰', label: 'Finance' },
  { icon: '🏢', label: 'Business' },    { icon: '👨‍👩‍👧', label: 'Family' },
  { icon: '🛍️', label: 'Consumer' },   { icon: '📱', label: 'Digital' },
  { icon: '🚗', label: 'Transport' },   { icon: '🏥', label: 'Healthcare' },
];

// ─── Shared inner Navbar ──────────────────────────────────────────────────────

function MockNavbar({ activeTab = 'Dashboard' }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0f0', padding: '0 12px', display: 'flex', alignItems: 'center', height: 46, gap: 8, flexShrink: 0 }}>
      <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 26, objectFit: 'contain', flexShrink: 0 }} />
      {/* Desktop nav pills */}
      <div style={{ display: 'flex', gap: 1, flex: 1 }}>
        {['Dashboard', 'Analyse', 'Chat', 'Library', 'Lawyers'].map((label) => (
          <div key={label} style={{
            padding: '4px 8px', borderRadius: 9, fontSize: 10, fontWeight: 600,
            color: label === activeTab ? '#fff' : '#9ca3af',
            background: label === activeTab ? '#1B4332' : 'transparent',
            transition: 'all 0.15s',
          }}>
            {label}
          </div>
        ))}
      </div>
      {/* Right controls */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {/* Language toggle */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2, gap: 1 }}>
          {[{ iso: 'gb', code: 'EN' }, { iso: 'fr', code: 'FR' }].map(({ iso, code }, i) => (
            <div key={code} style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 5px', borderRadius: 6, fontSize: 9, fontWeight: 700,
              background: i === 0 ? '#fff' : 'transparent',
              color: i === 0 ? '#374151' : '#9ca3af',
              boxShadow: i === 0 ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
              <img src={`https://flagcdn.com/16x12/${iso}.png`} width="14" height="11" alt={code} style={{ borderRadius: 2, display: 'block' }} />
              {code}
            </div>
          ))}
        </div>
        {/* Theme icon */}
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </div>
        {/* Avatar pill button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #e5e7eb', borderRadius: 10, padding: '2px 7px 2px 3px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ position: 'relative', width: 22, height: 22, flexShrink: 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden' }}>
              <svg width="22" height="22" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="40" fill="#1B4332"/>
                <path d="M12 80 Q12 58 40 58 Q68 58 68 80Z" fill="#0e2419"/>
                <ellipse cx="40" cy="32" rx="16" ry="18" fill="#C68642"/>
                <path d="M24 26 Q24 14 40 13 Q56 14 56 26 Q56 18 40 16 Q24 18 24 26Z" fill="#1a0a00"/>
                <path d="M35 41 Q40 44.5 45 41" stroke="#A0522D" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: '#6B7280', border: '1.5px solid #fff' }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#374151', lineHeight: 1 }}>Kofi</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><path d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard phase ──────────────────────────────────────────────────────────

function DashboardView({ visibleDocs }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f9fafb', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MockNavbar activeTab="Dashboard" />
      <div style={{ padding: '14px 20px', flex: 1, overflow: 'hidden', maxWidth: 520, width: '100%', margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Hi, Kofi 👋</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Your document analyses</p>
          </div>
          <div style={{ background: '#1B4332', color: '#fff', borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>+</span> Analyse
          </div>
        </div>

        {/* Quick access: Legal Chat + Law Library side by side */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 13, padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#1B4332" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#111827', margin: 0 }}>Legal Chat</p>
              <p style={{ fontSize: 9, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ask any legal question</p>
            </div>
          </div>
          <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 13, padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#111827', margin: 0 }}>Law Library</p>
              <p style={{ fontSize: 9, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Know your rights in GH</p>
            </div>
          </div>
        </div>

        {/* Plan banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 13, padding: '8px 13px', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#1B4332', margin: 0 }}>Free trial: 2 analyses remaining</p>
            <p style={{ fontSize: 9, color: '#52B788', margin: 0 }}>Analyse a document or choose a plan.</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {[0,1,2].map((i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < 1 ? '#1B4332' : '#bbf7d0' }} />)}
          </div>
        </div>

        {/* Search + filter */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '9px 11px', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
            <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '5px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 9.5, color: '#9ca3af' }}>Search documents...</span>
            </div>
            <div style={{ background: '#1B4332', color: '#fff', borderRadius: 9, padding: '5px 11px', fontSize: 9.5, fontWeight: 600 }}>Search</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ label: 'All', active: true }, { label: 'High Risk', active: false }, { label: 'Medium', active: false }, { label: 'Low', active: false }].map(({ label, active }) => (
              <div key={label} style={{ padding: '2px 9px', borderRadius: 20, fontSize: 9, fontWeight: 500, background: active ? '#1B4332' : '#fff', color: active ? '#fff' : '#6b7280', border: `1px solid ${active ? '#1B4332' : '#e5e7eb'}` }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Month group */}
        {visibleDocs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, whiteSpace: 'nowrap' }}>This month</p>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 9, color: '#d1d5db', flexShrink: 0 }}>{visibleDocs.length} doc{visibleDocs.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Doc cards */}
        {visibleDocs.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
            {visibleDocs.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderTop: i > 0 ? '1px solid #f3f4f6' : 'none', animation: 'previewSlideIn 0.3s ease' }}>
                <div style={{ width: 3, height: 34, borderRadius: 9999, background: doc.strip, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.type}</p>
                  <p style={{ fontSize: 9.5, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                  <p style={{ fontSize: 9, color: '#d1d5db', margin: '1px 0 0' }}>{doc.date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Legal Chat phase ─────────────────────────────────────────────────────────

function ChatView({ messages, typing }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f9fafb', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MockNavbar activeTab="Chat" />
      <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxWidth: 520, width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Legal Chat</p>
          <p style={{ fontSize: 9.5, color: '#9ca3af', margin: 0 }}>Ask any question about the law — no document needed</p>
        </div>

        {/* Language selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response language:</span>
          {['English', 'Twi', 'Français', 'Hausa'].map((lang, i) => (
            <div key={lang} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 600, background: i === 0 ? '#1B4332' : '#fff', color: i === 0 ? '#fff' : '#9ca3af', border: `1px solid ${i === 0 ? '#1B4332' : '#e5e7eb'}` }}>
              {lang}
            </div>
          ))}
        </div>

        {/* Quota bar */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '6px 10px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, color: '#1B4332', fontWeight: 600 }}>5 chats remaining today</span>
          <span style={{ fontSize: 9, color: '#52B788' }}>Individual plan</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 7, animation: 'previewSlideIn 0.3s ease' }}>
              {msg.role === 'ai' && (
                <div style={{ width: 26, height: 26, borderRadius: 8, background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                </div>
              )}
              <div style={{ maxWidth: '75%', padding: '8px 11px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.role === 'user' ? '#1B4332' : '#fff', border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb', color: msg.role === 'user' ? '#fff' : '#374151', fontSize: 10, lineHeight: 1.55 }}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing dots */}
          {typing && (
            <div style={{ display: 'flex', gap: 7, animation: 'previewSlideIn 0.3s ease' }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 2px', background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af', animation: `typingDot 1.2s ${j*0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ marginTop: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 13, padding: '7px 9px', display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ flex: 1, fontSize: 9.5, color: '#9ca3af' }}>Ask a legal question...</div>
          <div style={{ background: '#1B4332', color: '#fff', borderRadius: 8, padding: '5px 12px', fontSize: 9.5, fontWeight: 600 }}>Send</div>
        </div>
      </div>
    </div>
  );
}

// ─── Law Library phase ────────────────────────────────────────────────────────

function LibraryView({ activeCat }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f9fafb', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MockNavbar activeTab="Library" />

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📚</div>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#1B4332', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Law Library</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>Know your rights in Ghana</p>
        <p style={{ fontSize: 9, color: '#9ca3af', margin: 0 }}>Powered by AI with live law search</p>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, background: '#f0fdf4', color: '#1B4332', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>🇬🇭 Ghana</span>
        </div>
      </div>

      <div style={{ padding: '10px 12px', flex: 1, overflow: 'hidden' }}>
        {/* Category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginBottom: 10 }}>
          {MOCK_LIB_CATS.map((cat, i) => (
            <div key={cat.label} style={{ background: i === activeCat ? '#1B4332' : '#fff', border: `1px solid ${i === activeCat ? '#1B4332' : '#e5e7eb'}`, borderRadius: 9, padding: '7px 4px', textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ fontSize: 13, marginBottom: 2 }}>{cat.icon}</div>
              <p style={{ fontSize: 8, fontWeight: 600, margin: 0, color: i === activeCat ? '#fff' : '#374151', lineHeight: 1.2 }}>{cat.label}</p>
            </div>
          ))}
        </div>

        {/* Guide snippet */}
        {activeCat !== null && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', animation: 'previewSlideIn 0.3s ease' }}>
            <div style={{ padding: '9px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>{MOCK_LIB_CATS[activeCat]?.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{MOCK_LIB_CATS[activeCat]?.label} Law — Ghana</span>
            </div>
            <div style={{ padding: '9px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#1B4332', margin: '0 0 4px' }}>Notice Period Rights</p>
              <p style={{ fontSize: 9.5, color: '#4b5563', lineHeight: 1.55, margin: 0 }}>
                Under Ghana's Labour Act (Act 651), employees must receive minimum notice based on contract duration. You are entitled to written reasons for termination.
              </p>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 8, background: '#f0fdf4', color: '#1B4332', border: '1px solid #bbf7d0', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Labour Act (Act 651)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analysis phase ───────────────────────────────────────────────────────────

function AnalysisView({ visibleClauses, scanPct, scanning }) {
  const radius = 22; const circ = 2 * Math.PI * radius; const dash = 0.78 * circ;
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F8FAF7', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MockNavbar activeTab="Dashboard" />
      {/* Sub-bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f5f5f5', padding: '5px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#1B4332', fontWeight: 500 }}>← Dashboard</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ padding: '3px 8px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 10, color: '#6b7280' }}>Share</div>
          <div style={{ padding: '3px 8px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 10, color: '#6b7280' }}>Export PDF</div>
        </div>
      </div>

      {/* Two-column */}
      <div style={{ display: 'flex', gap: 10, padding: '10px 12px', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 155, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 13, padding: '11px 10px' }}>
            {/* Risk ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: 9 }}>
              <div style={{ position: 'relative', width: 54, height: 54 }}>
                <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="27" cy="27" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="5" />
                  <circle cx="27" cy="27" r={radius} fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔴</div>
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '2px 8px' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>High Risk</span>
              </div>
            </div>
            <p style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', margin: '0 0 3px' }}>Employment Contract</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#374151', textAlign: 'center', margin: '0 0 9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Employment_Contract.pdf</p>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 7, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { label: 'Dangerous', color: '#ef4444', text: '#dc2626', count: 2 },
                { label: 'Your rights', color: '#3b82f6', text: '#2563eb', count: 1 },
                { label: 'Standard', color: '#22c55e', text: '#16a34a', count: 1 },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 5px', borderRadius: 7, background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 9, color: item.text }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: item.text }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ask Klaro */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 13, padding: '9px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#111827' }}>Ask Klaro</p>
            </div>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 6px', fontSize: 9, color: '#9ca3af', marginBottom: 5, height: 26 }}>Ask about this document...</div>
            <div style={{ background: '#1B4332', borderRadius: 7, padding: '4px', textAlign: 'center', fontSize: 9, color: '#fff', fontWeight: 600 }}>Ask</div>
          </div>
        </div>

        {/* Right: clauses */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, overflow: 'hidden' }}>
          {/* Summary */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 13, padding: '10px 12px', flexShrink: 0 }}>
            <p style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Summary</p>
            {scanning ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Analysing with Klaro AI...</span>
                  <span style={{ fontSize: 10, color: '#D4A017', fontWeight: 600 }}>{scanPct}%</span>
                </div>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${scanPct}%`, background: 'linear-gradient(90deg, #1B4332, #52B788)', borderRadius: 4, transition: 'width 0.025s linear' }} />
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.5 }}>
                This agreement contains clauses that may conflict with your country's Labour Act. Review RED items before signing.
              </p>
            )}
          </div>

          {/* Filter pills */}
          {!scanning && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {[['All', '#111827', '#fff'], ['Danger', '#fff', '#ef4444'], ['Your rights', '#fff', '#3b82f6'], ['Standard', '#fff', '#22c55e']].map(([f, txtColor, dotColor], i) => (
                <div key={f} style={{ padding: '3px 9px', borderRadius: 20, background: i === 0 ? '#111827' : '#fff', color: i === 0 ? '#fff' : '#6b7280', fontSize: 9, fontWeight: 600, border: `1px solid ${i === 0 ? '#111827' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', gap: 3 }}>
                  {i > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor }} />}
                  {f}
                </div>
              ))}
            </div>
          )}

          {/* Clause cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
            {visibleClauses.map((c, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 11, display: 'flex', overflow: 'hidden', animation: 'previewSlideIn 0.3s ease' }}>
                <div style={{ width: 3, background: c.color, flexShrink: 0 }} />
                <div style={{ padding: '8px 10px', flex: 1 }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: c.lightText, background: c.lightBg, border: `1px solid ${c.lightBorder}`, borderRadius: 20, padding: '1px 6px' }}>{c.label}</span>
                  <p style={{ color: '#374151', fontSize: 10, margin: '4px 0 2px', lineHeight: 1.4, fontStyle: 'italic' }}>"{c.text.length > 55 ? c.text.slice(0, 55) + '…' : c.text}"</p>
                  <p style={{ color: '#6b7280', fontSize: 9.5, margin: 0, lineHeight: 1.4 }}>{c.explanation}</p>
                </div>
              </div>
            ))}
            {!scanning && visibleClauses.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40 }}>
                <div style={{ width: 14, height: 14, border: '2px solid #1B4332', borderTopColor: 'transparent', borderRadius: '50%', animation: 'previewSpin 0.8s linear infinite' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Combined preview controller ──────────────────────────────────────────────
// Cycles: dashboard → analysis → chat → library → dashboard

function AnalysisPreview() {
  const [phase,          setPhase]          = useState('dashboard');
  const [visibleDocs,    setVisibleDocs]    = useState([]);
  const [visibleClauses, setVisibleClauses] = useState([]);
  const [scanning,       setScanning]       = useState(false);
  const [scanPct,        setScanPct]        = useState(0);
  const [chatMessages,   setChatMessages]   = useState([]);
  const [chatTyping,     setChatTyping]     = useState(false);
  const [activeCat,      setActiveCat]      = useState(null);
  const docIdxRef    = useRef(0);
  const clauseIdxRef = useRef(0);
  const chatIdxRef   = useRef(0);

  // ── Dashboard phase ──
  useEffect(() => {
    if (phase !== 'dashboard') return;
    setVisibleDocs([]); docIdxRef.current = 0;
    const t = setInterval(() => {
      if (docIdxRef.current < MOCK_DOCS.length) {
        const i = docIdxRef.current++;
        setVisibleDocs((p) => [...p, MOCK_DOCS[i]]);
      } else {
        clearInterval(t);
        setTimeout(() => { setPhase('analysis'); setScanning(true); setScanPct(0); }, 1800);
      }
    }, 700);
    return () => clearInterval(t);
  }, [phase]);

  // ── Analysis: scan bar ──
  useEffect(() => {
    if (phase !== 'analysis' || !scanning) return;
    let pct = 0;
    const t = setInterval(() => {
      pct += 2; setScanPct(Math.min(pct, 100));
      if (pct >= 100) { clearInterval(t); setScanning(false); setVisibleClauses([]); clauseIdxRef.current = 0; }
    }, 25);
    return () => clearInterval(t);
  }, [phase, scanning]);

  // ── Analysis: clause cards ──
  useEffect(() => {
    if (phase !== 'analysis' || scanning) return;
    const t = setInterval(() => {
      if (clauseIdxRef.current < MOCK_CLAUSES.length) {
        const i = clauseIdxRef.current++;
        setVisibleClauses((p) => [...p, MOCK_CLAUSES[i]]);
      } else {
        clearInterval(t);
        setTimeout(() => { setPhase('chat'); setVisibleClauses([]); }, 2500);
      }
    }, 900);
    return () => clearInterval(t);
  }, [phase, scanning]);

  // ── Chat phase ──
  useEffect(() => {
    if (phase !== 'chat') return;
    setChatMessages([]); setChatTyping(false); chatIdxRef.current = 0;
    const steps = [
      () => { setChatMessages([MOCK_CHAT[0]]); },
      () => { setChatTyping(true); },
      () => { setChatTyping(false); setChatMessages(MOCK_CHAT); },
      () => { setTimeout(() => setPhase('library'), 2200); },
    ];
    const delays = [600, 1400, 3200, 4800];
    const timers = delays.map((d, i) => setTimeout(steps[i], d));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // ── Library phase ──
  useEffect(() => {
    if (phase !== 'library') return;
    setActiveCat(null);
    const t1 = setTimeout(() => setActiveCat(1), 1000);
    const t2 = setTimeout(() => { setPhase('dashboard'); setChatMessages([]); setActiveCat(null); }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === 'dashboard') return <DashboardView visibleDocs={visibleDocs} />;
  if (phase === 'analysis')  return <AnalysisView visibleClauses={visibleClauses} scanPct={scanPct} scanning={scanning} />;
  if (phase === 'chat')      return <ChatView messages={chatMessages} typing={chatTyping} />;
  return <LibraryView activeCat={activeCat} />;
}

// ─── Mouse Cursor ─────────────────────────────────────────────────────────────

const CURSOR_WAYPOINTS = [
  { x: 340, y: 195, pause: 1000, click: false }, // hover doc card
  { x: 340, y: 195, pause: 800,  click: true  }, // click doc card
  { x: 480, y: 270, pause: 1100, click: false }, // clause area
  { x: 480, y: 330, pause: 900,  click: true  }, // click clause
  { x: 150, y: 320, pause: 1000, click: false }, // sidebar Ask Klaro
  { x: 370, y: 380, pause: 1200, click: false }, // chat input
  { x: 530, y: 380, pause: 800,  click: true  }, // click Send
  { x: 200, y: 260, pause: 1000, click: false }, // library category
  { x: 200, y: 260, pause: 700,  click: true  }, // click category
  { x: 340, y: 44,  pause: 1200, click: false }, // nav bar
];

function MouseCursor() {
  const [pos,      setPos]      = useState({ x: 190, y: 58 });
  const [clicking, setClicking] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    let t;
    function next() {
      const wp = CURSOR_WAYPOINTS[idxRef.current % CURSOR_WAYPOINTS.length];
      setPos({ x: wp.x, y: wp.y });
      if (wp.click) {
        setTimeout(() => setClicking(true),  650);
        setTimeout(() => setClicking(false), 970);
      }
      idxRef.current++;
      t = setTimeout(next, wp.pause + 750);
    }
    t = setTimeout(next, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      zIndex: 20,
      pointerEvents: 'none',
      transition: 'left 0.72s cubic-bezier(0.4,0,0.2,1), top 0.72s cubic-bezier(0.4,0,0.2,1)',
      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))',
    }}>
      <svg
        width="18" height="22" viewBox="0 0 18 22"
        style={{ transform: clicking ? 'scale(0.82)' : 'scale(1)', transition: 'transform 0.1s ease', display: 'block' }}
      >
        <path d="M2 1l14.5 9-5.5 1.8-3.5 8.2L2 1z" fill="white" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      {clicking && (
        <div style={{
          position: 'absolute', top: -5, left: -5,
          width: 28, height: 28,
          border: '2px solid rgba(82,183,136,0.75)',
          borderRadius: '50%',
          animation: 'clickRipple 0.45s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

// ─── Browser Mockup ───────────────────────────────────────────────────────────

function BrowserMockup() {
  return (
    <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '75%', height: '50%', background: 'radial-gradient(ellipse, rgba(27,67,50,0.35) 0%, rgba(82,183,136,0.08) 60%, transparent 80%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--lnd-t10)', boxShadow: '0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px var(--lnd-t06)' }}>

        {/* Title bar — always dark chrome */}
        <div style={{ background: '#1d1d1f', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            {['#ff5f57', '#ffbd2e', '#28c840'].map((color, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}60` }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.25)', fontSize: 15, fontWeight: 300, userSelect: 'none', flexShrink: 0 }}>
            <span>‹</span><span>›</span>
          </div>
          <div style={{ flex: 1, background: '#2d2d2f', borderRadius: 7, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ flexShrink: 0 }}>
              <rect x="1" y="5" width="9" height="8" rx="1.5" stroke="#52B788" strokeWidth="1.3" />
              <path d="M3.5 5V3.5a2 2 0 014 0V5" stroke="#52B788" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              klaro-africa.netlify.app/analysis/employment-contract
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, flexShrink: 0 }}>⇧</div>
        </div>

        {/* Tab bar — always dark */}
        <div style={{ background: '#262626', padding: '6px 16px 0', display: 'flex', alignItems: 'flex-end', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '6px 14px', fontSize: 12, background: '#F8FAF7', borderRadius: '7px 7px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src="/assets/logos/logo.png" style={{ height: 13 }} alt="" />
            <span style={{ color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>Employment Contract · klaro-africa</span>
            <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 13 }}>×</span>
          </div>
          <div style={{ padding: '6px 12px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>+</div>
        </div>

        {/* App content — always light themed */}
        <div style={{ height: 560, overflow: 'hidden', position: 'relative' }}>
          <AnalysisPreview />
          <MouseCursor />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, #F8FAF7)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Rotating Word ────────────────────────────────────────────────────────────

const HERO_WORDS = {
  en: ['employment contract', 'land agreement', 'loan form', 'music deal', 'tenancy agreement', 'business contract', 'insurance policy', 'court document'],
  fr: ['contrat de travail', 'accord foncier', 'formulaire de prêt', 'contrat musical', 'contrat de bail', 'contrat commercial', "police d'assurance", 'document judiciaire'],
};

function RotatingWord() {
  const { lang }               = useLang();
  const words                  = HERO_WORDS[lang] || HERO_WORDS.en;
  const [idx,      setIdx]     = useState(0);
  const [exiting,  setExiting] = useState(false);
  const [entering, setEntering]= useState(false);

  useEffect(() => { setIdx(0); }, [lang]);

  useEffect(() => {
    const timer = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % words.length);
        setExiting(false);
        setEntering(true);
        setTimeout(() => setEntering(false), 420);
      }, 280);
    }, 3000);
    return () => clearInterval(timer);
  }, [words.length]);

  const animation =
    exiting  ? 'wordExit 0.28s cubic-bezier(0.4,0,1,1) forwards' :
    entering ? 'wordEnter 0.42s cubic-bezier(0,0,0.2,1) forwards' : 'none';

  return <span style={{ display: 'inline-block', animation }}>{words[idx]}</span>;
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

const LAWS = [
  'Ghana Labour Act (Act 651)', 'Nigeria Labour Act 2004', 'Kenya Employment Act',
  'SA Basic Conditions of Employment Act', 'Ghana Lands Act (Act 1036)',
  'Nigeria Land Use Act', 'Kenya Land Act 2012', 'Rwanda Labour Code 2021',
  'Egypt Labour Law 12/2003', 'Tanzania ELRA 2004', 'OHADA Commercial Law',
  'Ghana Companies Act (Act 992)', 'SA National Credit Act', 'Ghana Rent Act',
];

function Marquee() {
  const items = [...LAWS, ...LAWS];
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 40, animation: 'marquee 28s linear infinite', width: 'max-content' }}>
        {items.map((law, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#52B788', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'var(--lnd-t45)', fontSize: 13, fontWeight: 500 }}>{law}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg, var(--lnd-bg), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(-90deg, var(--lnd-bg), transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({ num, title, desc, icon }) {
  return (
    <div className="step-card" style={{ background: 'var(--lnd-t03)', border: '1px solid var(--lnd-t08)', borderRadius: 20, padding: '28px 24px', flex: 1, minWidth: 0, position: 'relative' }}>
      <div className="step-icon-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(27,67,50,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 16 }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.08em', paddingTop: 12, lineHeight: 1 }}>step {num}</span>
      </div>
      <h3 style={{ color: 'var(--lnd-text)', fontWeight: 700, fontSize: 17, marginBottom: 8, marginTop: 0 }}>{title}</h3>
      <p style={{ color: 'var(--lnd-t50)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ─── Colour ratings ───────────────────────────────────────────────────────────

const RATINGS = [
  { label: 'GREEN',  sub: 'Standard',    desc: 'Normal and fair clause.',                  color: '#22c55e', bg: 'rgba(34,197,94,0.07)',    border: 'rgba(34,197,94,0.2)' },
  { label: 'YELLOW', sub: 'Attention',   desc: 'Unusual. Read carefully before signing.', color: '#eab308', bg: 'rgba(234,179,8,0.07)',     border: 'rgba(234,179,8,0.2)' },
  { label: 'RED',    sub: 'Danger',      desc: 'Potentially harmful. Get advice first.',   color: '#ef4444', bg: 'rgba(239,68,68,0.07)',     border: 'rgba(239,68,68,0.2)' },
  { label: 'BLUE',   sub: 'Your Rights', desc: 'This clause works in your favour.',        color: '#3b82f6', bg: 'rgba(59,130,246,0.07)',    border: 'rgba(59,130,246,0.2)' },
  { label: 'GREY',   sub: 'Boilerplate', desc: 'Standard legal text. Safe to ignore.',     color: '#9ca3af', bg: 'rgba(156,163,175,0.07)',   border: 'rgba(156,163,175,0.2)' },
];

// ─── Main Landing ─────────────────────────────────────────────────────────────

export default function Landing() {
  const loggedIn             = isLoggedIn();
  const { lang, setLang, t } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: 'var(--lnd-bg)', minHeight: '100vh', color: 'var(--lnd-text)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <style>{`
        /* ── Theme tokens: dark is :root default, light via html:not(.dark) ── */
        :root {
          --lnd-bg:     #070f0a;
          --lnd-text:   #ffffff;
          --lnd-t90:    rgba(255,255,255,0.90);
          --lnd-t80:    rgba(255,255,255,0.80);
          --lnd-t75:    rgba(255,255,255,0.75);
          --lnd-t60:    rgba(255,255,255,0.60);
          --lnd-t55:    rgba(255,255,255,0.55);
          --lnd-t50:    rgba(255,255,255,0.50);
          --lnd-t45:    rgba(255,255,255,0.45);
          --lnd-t40:    rgba(255,255,255,0.40);
          --lnd-t35:    rgba(255,255,255,0.35);
          --lnd-t28:    rgba(255,255,255,0.28);
          --lnd-t25:    rgba(255,255,255,0.25);
          --lnd-t20:    rgba(255,255,255,0.20);
          --lnd-t15:    rgba(255,255,255,0.15);
          --lnd-t12:    rgba(255,255,255,0.12);
          --lnd-t10:    rgba(255,255,255,0.10);
          --lnd-t08:    rgba(255,255,255,0.08);
          --lnd-t06:    rgba(255,255,255,0.06);
          --lnd-t05:    rgba(255,255,255,0.05);
          --lnd-t04:    rgba(255,255,255,0.04);
          --lnd-t03:    rgba(255,255,255,0.03);
          --lnd-t02:    rgba(255,255,255,0.02);
          --lnd-nav-bg: rgba(7,15,10,0.80);
        }
        html:not(.dark) {
          --lnd-bg:     #F8FAF7;
          --lnd-text:   #1A1A1A;
          --lnd-t90:    rgba(26,26,26,0.95);
          --lnd-t80:    rgba(26,26,26,0.88);
          --lnd-t75:    rgba(26,26,26,0.82);
          --lnd-t60:    rgba(26,26,26,0.68);
          --lnd-t55:    rgba(26,26,26,0.62);
          --lnd-t50:    rgba(26,26,26,0.55);
          --lnd-t45:    rgba(26,26,26,0.50);
          --lnd-t40:    rgba(26,26,26,0.44);
          --lnd-t35:    rgba(26,26,26,0.38);
          --lnd-t28:    rgba(26,26,26,0.32);
          --lnd-t25:    rgba(26,26,26,0.28);
          --lnd-t20:    rgba(26,26,26,0.22);
          --lnd-t15:    rgba(26,26,26,0.17);
          --lnd-t12:    rgba(26,26,26,0.13);
          --lnd-t10:    rgba(26,26,26,0.11);
          --lnd-t08:    rgba(26,26,26,0.09);
          --lnd-t06:    rgba(26,26,26,0.07);
          --lnd-t05:    rgba(26,26,26,0.05);
          --lnd-t04:    rgba(26,26,26,0.04);
          --lnd-t03:    rgba(26,26,26,0.03);
          --lnd-t02:    rgba(26,26,26,0.02);
          --lnd-nav-bg: rgba(248,250,247,0.88);
        }

        /* ── Animations ── */
        @keyframes previewSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes previewSpin    { to { transform:rotate(360deg); } }
        @keyframes marquee        { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes floatUp        { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulseGlow      { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes fadeInUp       { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes wordExit       { from { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } to { opacity:0; transform:translateY(-14px) scale(0.96); filter:blur(3px); } }
        @keyframes wordEnter      { from { opacity:0; transform:translateY(14px) scale(0.96); filter:blur(3px); } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
        @keyframes clickRipple    { from { transform:scale(0.4); opacity:1; } to { transform:scale(2); opacity:0; } }
        @keyframes typingDot      { 0%,100% { opacity:0.3; transform:translateY(0); } 50% { opacity:1; transform:translateY(-3px); } }

        /* ── Nav links ── */
        .lnd-nav-link {
          color: var(--lnd-t55); text-decoration: none;
          font-size: 14px; font-weight: 500;
          padding: 6px 14px; border-radius: 10px; transition: all 0.2s;
        }
        .lnd-nav-link:hover { color: var(--lnd-text); background: var(--lnd-t06); }

        /* ── Buttons ── */
        .lnd-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #1B4332; color: #fff; font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 14px; border: none;
          cursor: pointer; text-decoration: none; transition: all 0.2s;
          box-shadow: 0 0 0 1px rgba(82,183,136,0.3), 0 4px 20px rgba(27,67,50,0.4);
        }
        .lnd-btn-primary:hover {
          background: #143626;
          box-shadow: 0 0 0 1px rgba(82,183,136,0.5), 0 8px 30px rgba(27,67,50,0.6);
          transform: translateY(-1px);
        }
        .lnd-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--lnd-t05); color: var(--lnd-t80); font-weight: 600; font-size: 15px;
          padding: 14px 28px; border-radius: 14px; border: 1px solid var(--lnd-t10);
          cursor: pointer; text-decoration: none; transition: all 0.2s;
        }
        .lnd-btn-ghost:hover { background: var(--lnd-t08); border-color: var(--lnd-t15); }
        .lnd-btn-sm {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 8px 18px; border-radius: 11px; font-size: 13px; font-weight: 600;
          text-decoration: none; cursor: pointer; transition: all 0.2s;
        }
        .lnd-btn-sm:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Cards ── */
        .stat-card {
          background: var(--lnd-t03); border: 1px solid var(--lnd-t06);
          border-radius: 16px; padding: 24px 20px;
          text-align: center; flex: 1; min-width: 0; transition: all 0.2s;
        }
        .stat-card:hover { background: var(--lnd-t05); border-color: rgba(82,183,136,0.2); }
        @media (max-width: 480px) {
          .stat-card { padding: 16px 10px; border-radius: 12px; }
          .stat-value { font-size: 26px !important; }
          .stat-label { font-size: 11px !important; }
        }
        .rating-card {
          background: var(--lnd-t02); border: 1px solid var(--lnd-t06);
          border-radius: 16px; padding: 20px; transition: all 0.25s; cursor: default;
        }
        .rating-card:hover { background: var(--lnd-t05); border-color: var(--lnd-t12); transform: translateY(-3px); }
        .step-card { transition: all 0.25s; }
        .step-card:hover { transform: translateY(-3px); background: var(--lnd-t05) !important; }
        @media (max-width: 768px) {
          .step-card { text-align: center !important; }
          .step-card .step-icon-row { justify-content: center !important; }
          .rating-card { text-align: center !important; }
          .rating-label-row { justify-content: center !important; }
          .pricing-card { text-align: center !important; }
          .pricing-price-row { justify-content: center !important; }
          .pricing-features { align-items: center !important; }
        }
        .pricing-card { transition: all 0.25s; }
        .pricing-card:hover { transform: translateY(-4px); }

        /* ── Footer links ── */
        .lnd-footer-link { color: var(--lnd-t45); font-size: 14px; text-decoration: none; transition: color 0.2s; display: block; }
        .lnd-footer-link:hover { color: var(--lnd-text); }
        .footer-logo { height: 72px; object-fit: contain; margin-bottom: 14px; }

        /* ── Show/hide by breakpoint ── */
        .lnd-hide-mobile { }
        .lnd-show-mobile { display: none !important; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .steps-grid      { flex-direction: column !important; }
          .how-it-works-grid { grid-template-columns: 1fr !important; }
          .how-it-works-left { position: static !important; }
          .stats-row       { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .ratings-grid    { grid-template-columns: 1fr 1fr !important; }
          .pricing-grid    { grid-template-columns: 1fr 1fr !important; }
          .lnd-hide-mobile { display: none !important; }
          .lnd-show-mobile { display: flex !important; }
          .hero-ctas       { flex-direction: column !important; align-items: stretch !important; }
          .hero-trust      { justify-content: center !important; }
          .lnd-btn-primary, .lnd-btn-ghost { width: 100%; justify-content: center; }

          /* Browser mockup — scale so it fills ~90% of tablet width; clip sides cleanly */
          .browser-mockup-wrap {
            overflow: hidden;
            transform: scale(0.85);
            transform-origin: top center;
            margin-bottom: -96px;
          }

          /* Footer — center everything on mobile */
          .footer-top    { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .footer-brand  { max-width: 100% !important; align-items: center !important; display: flex !important; flex-direction: column !important; }
          .footer-links  { justify-content: center !important; gap: 32px !important; width: 100%; }
          .footer-links-group { text-align: center !important; }
          .footer-bottom { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; }
          .footer-logo   { height: 60px !important; }
          .section-heading { text-align: center !important; }
        }
        @media (max-width: 480px) {
          .pricing-grid  { grid-template-columns: 1fr !important; }
          .ratings-grid  { grid-template-columns: 1fr !important; }
          .footer-links  { flex-direction: column !important; align-items: center !important; gap: 24px !important; }
          .browser-mockup-wrap {
            overflow: hidden;
            transform: scale(0.68);
            transform-origin: top center;
            margin-bottom: -204px;
          }
          .lnd-section-lg { padding-top: 48px !important; padding-bottom: 48px !important; }
          .lnd-section-md { padding-top: 40px !important; padding-bottom: 40px !important; }
          .hero-sub-text  { font-size: 16px !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--lnd-nav-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--lnd-t06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* Logo */}
          <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 40, objectFit: 'contain' }} />
          </Link>

          {/* Desktop nav links */}
          <div className="lnd-hide-mobile" style={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <a href="#how-it-works" className="lnd-nav-link">{t('landing.footerHowItWorks')}</a>
            <a href="#ratings"      className="lnd-nav-link">{t('landing.footerColourSystem')}</a>
            <a href="#pricing"      className="lnd-nav-link">{t('landing.footerPricing')}</a>
            <Link to="/about"       className="lnd-nav-link">About</Link>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>

            {/* Language toggle */}
            <div style={{ display: 'flex', background: 'var(--lnd-t06)', border: '1px solid var(--lnd-t10)', borderRadius: 10, padding: 3, gap: 2 }}>
              {[{ code: 'en', iso: 'gb', label: 'EN' }, { code: 'fr', iso: 'fr', label: 'FR' }].map(({ code, iso, label }) => (
                <button key={code} onClick={() => setLang(code)} title={code === 'en' ? 'English' : 'Français'} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 8px', borderRadius: 7, cursor: 'pointer', border: 'none',
                  background: lang === code ? '#1B4332' : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  <img src={`https://flagcdn.com/20x15/${iso}.png`} width="18" height="13" alt={label} style={{ borderRadius: 2, display: 'block' }} />
                  <span className="lnd-hide-mobile" style={{ fontSize: 11, fontWeight: 700, color: lang === code ? '#fff' : 'var(--lnd-t55)', lineHeight: 1 }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Desktop: sign in (ghost) + get started (primary) */}
            {loggedIn ? (
              <Link to="/dashboard" className="lnd-btn-sm lnd-hide-mobile" style={{ background: '#1B4332', color: '#fff', boxShadow: '0 0 0 1px rgba(82,183,136,0.3), 0 2px 10px rgba(27,67,50,0.3)' }}>
                {t('nav.dashboard')} →
              </Link>
            ) : (
              <>
                <Link to="/auth" className="lnd-btn-sm lnd-hide-mobile" style={{ background: 'transparent', color: 'var(--lnd-t70)', border: '1px solid var(--lnd-t15)' }}>
                  {t('nav.signIn')}
                </Link>
                <Link to="/auth" className="lnd-btn-sm lnd-hide-mobile" style={{ background: '#1B4332', color: '#fff', boxShadow: '0 0 0 1px rgba(82,183,136,0.3), 0 2px 10px rgba(27,67,50,0.3)' }}>
                  {t('nav.getStarted')} →
                </Link>
              </>
            )}

            {/* Mobile: compact CTA */}
            <Link to="/auth" className="lnd-btn-sm lnd-show-mobile" style={{ background: '#1B4332', color: '#fff', fontSize: 12, padding: '7px 13px', boxShadow: '0 0 0 1px rgba(82,183,136,0.3)' }}>
              {loggedIn ? t('nav.dashboard') : t('nav.getStarted')}
            </Link>

            {/* Mobile: hamburger */}
            <button
              className="lnd-show-mobile"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              style={{ background: mobileMenuOpen ? 'var(--lnd-t08)' : 'none', border: '1px solid var(--lnd-t15)', borderRadius: 9, width: 38, height: 38, cursor: 'pointer', color: 'var(--lnd-t70)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
            >
              {mobileMenuOpen
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lnd-show-mobile" style={{ borderTop: '1px solid var(--lnd-t08)', padding: '8px 14px 16px', flexDirection: 'column', gap: 2, background: 'var(--lnd-nav-bg)', backdropFilter: 'blur(24px)' }}>
            {[
              { href: '#how-it-works', label: t('landing.footerHowItWorks') },
              { href: '#ratings',      label: t('landing.footerColourSystem') },
              { href: '#pricing',      label: t('landing.footerPricing') },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="lnd-nav-link" onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 12, fontSize: 15 }}>
                {label}
              </a>
            ))}
            <Link to="/about" className="lnd-nav-link" onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 12, fontSize: 15 }}>
              About us
            </Link>
            {!loggedIn && (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'block', marginTop: 6, textAlign: 'center', padding: '13px', borderRadius: 12, background: 'var(--lnd-t05)', border: '1px solid var(--lnd-t12)', color: 'var(--lnd-t80)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '60px 24px 64px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(27,67,50,0.45) 0%, rgba(82,183,136,0.1) 50%, transparent 70%)', pointerEvents: 'none', animation: 'pulseGlow 5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(212,160,23,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '8%', width: 250, height: 250, background: 'radial-gradient(ellipse, rgba(82,183,136,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', animation: 'fadeInUp 0.7s ease' }}>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em', color: 'var(--lnd-text)' }}>
            {t('landing.heroLine1')}<br />
            <span style={{ color: '#52B788', position: 'relative', display: 'inline-block', paddingBottom: 4 }}>
              <RotatingWord />
              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #1B4332, #52B788, #1B4332)', borderRadius: 2, opacity: 0.6 }} />
            </span>
            <br />
            <span style={{ color: 'var(--lnd-t90)' }}>{t('landing.heroLine3')}</span>
          </h1>

          {/* Subtext */}
          <p className="hero-sub-text" style={{ color: 'var(--lnd-t50)', fontSize: 18, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
            {t('landing.heroSubBody')}
            <strong style={{ color: 'var(--lnd-t75)' }}> {t('landing.heroNoLawyer')}</strong>
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            <Link to={loggedIn ? '/upload' : '/auth'} className="lnd-btn-primary" style={{ fontSize: 16, padding: '16px 32px' }}>
              {t('landing.heroCta1')} →
            </Link>
            <a href="#demo" className="lnd-btn-ghost" style={{ fontSize: 16, padding: '16px 32px' }}>
              {t('landing.heroCta2')}
            </a>
          </div>

          {/* Trust */}
          <div className="hero-trust" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', color: 'var(--lnd-t30)', fontSize: 13 }}>
            <span>{t('landing.trust3docs')}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--lnd-t20)', display: 'inline-block', flexShrink: 0 }} />
            <span>{t('landing.trustLine')} {t('landing.trustCountries')}</span>
          </div>
        </div>
      </section>

      {/* ── Country coverage strip ── */}
      <section style={{ borderTop: '1px solid var(--lnd-t06)', borderBottom: '1px solid var(--lnd-t06)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 18px' }}>
            Law coverage across Africa
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {[
              { iso: 'gh', name: 'Ghana' },
              { iso: 'ng', name: 'Nigeria' },
              { iso: 'za', name: 'South Africa' },
              { iso: 'ke', name: 'Kenya' },
              { iso: 'rw', name: 'Rwanda' },
              { iso: 'ci', name: "Côte d'Ivoire" },
              { iso: 'sn', name: 'Senegal' },
              { iso: 'eg', name: 'Egypt' },
              { iso: 'tz', name: 'Tanzania' },
            ].map(c => (
              <div key={c.iso} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', background: 'var(--lnd-t03)', border: '1px solid var(--lnd-t07)', borderRadius: 10 }}>
                <img src={`https://flagcdn.com/24x18/${c.iso}.png`} width="22" height="16" alt={c.name} style={{ borderRadius: 3, display: 'block' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--lnd-t55)', whiteSpace: 'nowrap' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ghana laws marquee ── */}
      <section style={{ padding: '28px 0', borderBottom: '1px solid var(--lnd-t06)' }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--lnd-t25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          {t('landing.marqueeLine')}
        </p>
        <Marquee />
      </section>

      {/* ── Browser Mockup (demo) ── */}
      <section id="demo" className="lnd-section-lg" style={{ padding: '96px 24px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 14px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              {t('landing.demoTitle')}
            </h2>
            <p style={{ color: 'var(--lnd-t45)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              {t('landing.demoSub')}
            </p>
          </div>
          <div className="browser-mockup-wrap">
            <div style={{ animation: 'floatUp 7s ease-in-out infinite' }}>
              <BrowserMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '80px 24px', borderTop: '1px solid var(--lnd-t06)' }}>
        <div className="how-it-works-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 80px', alignItems: 'start' }}>
          <div className="how-it-works-left" style={{ position: 'sticky', top: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#52B788', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 20px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              {t('landing.howTitle')}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--lnd-t45)', margin: '0 0 32px' }}>
              {t('landing.howSub')}
            </p>
            <a href={`#demo`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#52B788', textDecoration: 'none' }}>
              See a demo below ↓
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              {
                num: '01',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
                title: t('landing.step1Title'),
                desc: t('landing.step1Desc'),
              },
              {
                num: '02',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
                title: t('landing.step2Title'),
                desc: t('landing.step2Desc'),
              },
              {
                num: '03',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
                title: t('landing.step3Title'),
                desc: t('landing.step3Desc'),
              },
            ].map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: 20, padding: '28px 0', borderBottom: i < 2 ? '1px solid var(--lnd-t06)' : 'none' }}>
                <div style={{ flexShrink: 0, paddingTop: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--lnd-t20)', letterSpacing: '0.06em' }}>{step.num}</span>
                </div>
                <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 11, background: 'rgba(27,67,50,0.25)', border: '1px solid rgba(82,183,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--lnd-text)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--lnd-t45)', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Colour system ── */}
      <section id="ratings" style={{ padding: '80px 24px', borderTop: '1px solid var(--lnd-t06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
              {t('landing.ratingsTitle')}
            </h2>
            <p style={{ color: 'var(--lnd-t40)', fontSize: 16 }}>{t('landing.ratingsSub')}</p>
          </div>
          <div className="ratings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {RATINGS.map((r) => (
              <div key={r.label} className="rating-card" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                <div className="rating-label-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: r.color, letterSpacing: '0.08em' }}>{r.label}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--lnd-text)', marginBottom: 6 }}>{r.sub}</p>
                <p style={{ fontSize: 12, color: 'var(--lnd-t45)', margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '80px 24px', borderTop: '1px solid var(--lnd-t06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>{t('landing.pricingTitle')}</h2>
            <p style={{ color: 'var(--lnd-t40)', fontSize: 16 }}>{t('landing.pricingSub')}</p>
          </div>

          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { nameKey: 'plan1Name', priceKey: 'plan1Price', period: '',     featureKeys: ['plan1f1','plan1f2','plan1f3','plan1f4'], free: true,  popular: false },
              { nameKey: 'plan2Name', priceKey: null,         period: '/doc', featureKeys: ['plan2f1','plan2f2','plan2f3','plan2f4'], free: false, popular: false, priceRaw: 'From GH₵ 55' },
              { nameKey: 'plan3Name', priceKey: null,         period: '/mo',  featureKeys: ['plan3f1','plan3f2','plan3f3','plan3f4'], free: false, popular: true,  priceRaw: 'From GH₵ 89' },
              { nameKey: 'plan4Name', priceKey: null,         period: '/mo',  featureKeys: ['plan4f1','plan4f2','plan4f3','plan4f4'], free: false, popular: false, priceRaw: 'From GH₵ 199' },
            ].map((plan) => (
              <div key={plan.nameKey} className="pricing-card" style={{
                background: plan.popular ? 'rgba(27,67,50,0.35)' : 'var(--lnd-t02)',
                border: `1px solid ${plan.popular ? 'rgba(82,183,136,0.4)' : 'var(--lnd-t08)'}`,
                borderRadius: 20, padding: '28px 24px', position: 'relative',
                boxShadow: plan.popular ? '0 0 40px rgba(27,67,50,0.3)' : 'none',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1B4332', border: '1px solid rgba(82,183,136,0.4)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                    {t('landing.pricingMostPopular')}
                  </div>
                )}
                <p style={{ fontSize: 14, color: plan.popular ? '#52B788' : 'var(--lnd-t50)', fontWeight: 700, marginBottom: 8 }}>{t(`landing.${plan.nameKey}`)}</p>
                <div className="pricing-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20, flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: plan.priceRaw ? 22 : 32, fontWeight: 900, color: 'var(--lnd-text)', whiteSpace: 'nowrap' }}>{plan.priceKey ? t(`landing.${plan.priceKey}`) : plan.priceRaw}</span>
                  <span style={{ fontSize: 13, color: 'var(--lnd-t35)', whiteSpace: 'nowrap' }}>{plan.period}</span>
                </div>
                <div className="pricing-features" style={{ borderTop: '1px solid var(--lnd-t08)', paddingTop: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.featureKeys.map((fk) => (
                    <div key={fk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: plan.popular ? '#52B788' : 'var(--lnd-t25)', flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: 13, color: 'var(--lnd-t55)' }}>{t(`landing.${fk}`)}</span>
                    </div>
                  ))}
                </div>
                <Link to={loggedIn ? '/upload' : '/auth'} style={{
                  display: 'block', textAlign: 'center', padding: '11px', borderRadius: 12,
                  background: plan.popular ? '#1B4332' : 'var(--lnd-t05)',
                  border: `1px solid ${plan.popular ? 'rgba(82,183,136,0.4)' : 'var(--lnd-t10)'}`,
                  color: plan.popular ? '#fff' : 'var(--lnd-t80)',
                  fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  {plan.free ? t('landing.pricingStartFree') : t('landing.pricingGetStarted')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(27,67,50,0.4) 0%, rgba(82,183,136,0.06) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em', color: 'var(--lnd-text)' }}>
            {t('landing.ctaTitle')}
          </h2>
          <p style={{ color: 'var(--lnd-t45)', fontSize: 18, marginBottom: 40 }}>
            {t('landing.ctaSub')}
          </p>
          <Link to={loggedIn ? '/upload' : '/auth'} className="lnd-btn-primary" style={{ fontSize: 16, padding: '18px 40px' }}>
            {t('landing.ctaBtn')} →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--lnd-t06)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="footer-top" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, marginBottom: 40 }}>

            <div className="footer-brand" style={{ maxWidth: 280 }}>
              <img src="/assets/logos/logo.png" alt="Klaro" className="footer-logo" />
              <p style={{ color: 'var(--lnd-t45)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {t('landing.footerTagline')}
              </p>
              <p style={{ color: 'var(--lnd-t25)', fontSize: 12, marginTop: 10 }}>
                {t('landing.footerDisclaimer')}
              </p>
            </div>

            <div className="footer-links" style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div className="footer-links-group">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>{t('landing.footerProduct')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a href="#how-it-works" className="lnd-footer-link">{t('landing.footerHowItWorks')}</a>
                  <a href="#ratings"      className="lnd-footer-link">{t('landing.footerColourSystem')}</a>
                  <a href="#pricing"      className="lnd-footer-link">{t('landing.footerPricing')}</a>
                  <Link to="/about"       className="lnd-footer-link">About us</Link>
                  <Link to="/auth"        className="lnd-footer-link">{t('landing.footerSignIn')}</Link>
                </div>
              </div>
              <div className="footer-links-group">
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lnd-t25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>{t('landing.footerLegal')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/privacy" className="lnd-footer-link">{t('landing.footerPrivacy')}</Link>
                  <Link to="/terms"   className="lnd-footer-link">{t('landing.footerTerms')}</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom" style={{ borderTop: '1px solid var(--lnd-t06)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ color: 'var(--lnd-t20)', fontSize: 13, margin: 0 }}>
              © {new Date().getFullYear()} {t('landing.footerBuiltBy')}{' '}
              <a
                href="https://wa.me/233542510400"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#52B788', fontWeight: 700, textDecoration: 'none' }}
              >
                Tboye Creative Solutions
              </a>
            </p>
            {/* Language toggle in footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', background: 'var(--lnd-t04)', border: '1px solid var(--lnd-t08)', borderRadius: 8, padding: 2, gap: 2 }}>
                {[{ code: 'en', iso: 'gb', label: 'English' }, { code: 'fr', iso: 'fr', label: 'Français' }].map(({ code, iso, label }) => (
                  <button key={code} onClick={() => setLang(code)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: lang === code ? '#1B4332' : 'transparent',
                    color: lang === code ? '#fff' : 'var(--lnd-t40)',
                    transition: 'all 0.15s',
                    opacity: lang === code ? 1 : 0.6,
                  }}>
                    <img src={`https://flagcdn.com/20x15/${iso}.png`} width="20" height="15" alt={label} style={{ borderRadius: 2, display: 'block' }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
