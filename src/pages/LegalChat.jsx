import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearSession } from '../lib/auth';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LangContext';

const LANG_LABELS = {
  en: 'English', tw: 'Twi', ga: 'Ga', ewe: 'Ewe', dag: 'Dagbani', ha: 'Hausa', fan: 'Fante',
};

const PLAN_LIMITS = {
  trial:        { max: 5,   label: '5 free questions total' },
  pay_per_doc:  { max: 5,   label: '5 questions/month' },
  individual:   { max: 30,  label: '30 questions/month' },
  professional: { max: null, label: 'Unlimited' },
  business:     { max: null, label: 'Unlimited' },
};

const QUICK_PROMPTS = [
  { icon: '🏠', text: 'Can my landlord evict me without giving notice?' },
  { icon: '💼', text: 'What rights do I have if my employer fires me without reason?' },
  { icon: '📝', text: 'Is a contract valid without a lawyer or stamp?' },
  { icon: '💰', text: 'What is the maximum rental advance a landlord can charge?' },
  { icon: '👶', text: 'What are my rights as a parent in a child custody case?' },
  { icon: '🏗️', text: 'What documents do I need to check before buying land in Ghana?' },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? 'bg-[#1B4332]' : 'bg-[#52B788]/20 border border-[#52B788]/30'
      }`}>
        {isUser ? (
          <svg className="w-4 h-4 text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <img src="/assets/logos/logo.png" alt="Klaro" className="w-5 h-5 object-contain" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#1B4332] text-white rounded-tr-sm'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm'
      }`}>
        {msg.text.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < msg.text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
        {msg.error && (
          <p className="text-red-300 text-xs mt-1">{msg.error}</p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#52B788]/20 border border-[#52B788]/30 flex items-center justify-center flex-shrink-0">
        <img src="/assets/logos/logo.png" alt="Klaro" className="w-5 h-5 object-contain" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 bg-[#52B788] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LegalChat() {
  const navigate  = useNavigate();
  const { t }     = useLang();
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [respLang, setRespLang] = useState('en');
  const [loading,  setLoading]  = useState(false);
  const [quota,    setQuota]    = useState(null); // { remaining, max, plan }
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput('');

    const userMsg = { role: 'user', text: trimmed, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.legalChat(trimmed, respLang);
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer, id: Date.now() + 1 }]);
      if (data.remaining !== null && data.remaining !== undefined) {
        setQuota({ remaining: data.remaining, max: data.limit, plan: data.plan });
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: e.status === 403 ? t('chat.errorLimit') : t('chat.errorGeneric'),
        id: Date.now() + 1,
        error: e.status === 403 ? null : e.message,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const empty = messages.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} wide />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4">

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B4332] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white text-lg">{t('chat.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('chat.subtitle')}</p>
            </div>

            {/* Quota badge */}
            {quota && quota.max !== null && (
              <div className={`flex-shrink-0 text-center px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                quota.remaining === 0
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : quota.remaining <= 3
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                <p className="text-base font-black">{quota.remaining}</p>
                <p>{t('chat.left')}</p>
              </div>
            )}
          </div>

          {/* Language + plan info row */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">{t('chat.langLabel')}:</span>
              <select
                value={respLang}
                onChange={e => setRespLang(e.target.value)}
                className="input text-xs py-1.5 pr-6 w-auto"
              >
                {Object.entries(LANG_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
            <div className="h-3 w-px bg-gray-200 dark:bg-gray-600" />
            <p className="text-xs text-gray-400">
              <span className="font-medium text-gray-600 dark:text-gray-300">Not legal advice.</span>{' '}
              Klaro explains Ghana law — consult a{' '}
              <Link to="/lawyers" className="text-[#1B4332] dark:text-[#52B788] underline">qualified lawyer</Link>{' '}
              for your specific situation.
            </p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-[400px]">
          {empty ? (
            /* Empty state — quick prompts */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t('chat.emptyTitle')}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">{t('chat.quickPrompts')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="flex items-start gap-2.5 text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#52B788] hover:bg-[#52B788]/5 transition-colors text-sm text-gray-700 dark:text-gray-300 group"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{p.icon}</span>
                    <span className="group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message history */
            <div className="flex-1 space-y-4 pb-2">
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Upgrade nudge when quota is low or exhausted */}
        {quota && quota.max !== null && quota.remaining <= 2 && (
          <div className={`rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm ${
            quota.remaining === 0
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          }`}>
            <p className={quota.remaining === 0 ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}>
              {quota.remaining === 0
                ? t('chat.limitExhausted')
                : t('chat.limitLabel').replace('{remaining}', quota.remaining).replace('{max}', quota.max)}
            </p>
            <Link to="/payment" className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1B4332] text-white hover:bg-[#163829] transition-colors">
              {t('chat.upgrade')}
            </Link>
          </div>
        )}

        {/* Input area */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-sm">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              rows={1}
              disabled={quota?.remaining === 0 && quota?.max !== null}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none min-h-[24px] max-h-[160px] leading-relaxed disabled:opacity-50"
              style={{ overflow: 'hidden' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || (quota?.remaining === 0 && quota?.max !== null)}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#1B4332] text-[#52B788] flex items-center justify-center disabled:opacity-40 hover:bg-[#163829] transition-colors"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#52B788]/30 border-t-[#52B788] rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-0.5">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
