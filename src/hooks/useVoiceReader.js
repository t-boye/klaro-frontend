import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

// Languages routed to GhanaNLP backend for real native voices:
//   tw  = Twi  (twi_speaker_4–9)
//   ewe = Ewe  (ewe_speaker_3–4)
//   fan = Fante → routed through Twi speaker (Akan dialect, ~80% shared phonology)
// Everything else (en, ga, dag, ha) uses Web Speech API
const GHANA_NLP_LANGS = new Set(['tw', 'ewe', 'fan']);

// Web Speech API voice chain — best-effort fallback for all langs (incl. GhanaNLP fallback)
const VOICE_CHAIN = {
  en:  ['en-GH', 'en-NG', 'en-ZA', 'en-GB', 'en'],
  tw:  ['en-GH', 'en-NG', 'en-ZA', 'en-GB', 'en'],
  ewe: ['en-GH', 'en-NG', 'en-ZA', 'en-GB', 'en'],
  fan: ['en-GH', 'en-NG', 'en-GB', 'en'],
  sw:  ['sw', 'sw-KE', 'sw-TZ', 'en-KE', 'en'],
  fr:  ['fr-FR', 'fr-BE', 'fr-CH', 'fr', 'en'],
  ar:  ['ar-EG', 'ar-SA', 'ar', 'en'],
};

const RATE_STEPS = [0.75, 1, 1.25, 1.5, 2];

// Browsers block audio.play() called from async code unless the audio context
// was already unlocked by a direct user gesture. This fires a silent 1-sample
// burst during the synchronous click handler so subsequent async plays work.
let _audioUnlocked = false;
function unlockAudio() {
  if (_audioUnlocked || typeof window === 'undefined') return;
  _audioUnlocked = true;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.resume().catch(() => {});
    setTimeout(() => ctx.close().catch(() => {}), 200);
  } catch {}
}

// ── Web Speech API voice loader ───────────────────────────────────────────────
let _voices = [];
function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const update = () => { const v = window.speechSynthesis.getVoices(); if (v.length) _voices = v; };
  window.speechSynthesis.addEventListener('voiceschanged', update);
  update();
}
loadVoices();

function pickVoice(lang) {
  const voices = _voices.length ? _voices : (window.speechSynthesis?.getVoices() || []);
  const chain  = VOICE_CHAIN[lang] || VOICE_CHAIN.en;
  for (const code of chain) {
    const lc = code.toLowerCase();
    const v  = voices.find(v => v.lang.toLowerCase() === lc)
             || voices.find(v => v.lang.toLowerCase().startsWith(lc));
    if (v) return v;
  }
  return voices[0] || null;
}

// ── Browser-side TTS cache ────────────────────────────────────────────────────
// Prevents calling GhanaNLP API twice for the same text.
// Keys: "lang::text". Values: Blob URLs.
// Cleared when the page unloads (sessionStorage-lifetime).
const _audioCache = new Map();

// ── GhanaNLP circuit breaker ──────────────────────────────────────────────────
// After 2 consecutive failures (timeout or error), skip GhanaNLP for the rest
// of the session and go directly to Web Speech instead of waiting every time.
let _ghanaNLPFailCount  = 0;
let _ghanaNLPDisabled   = false;
const GHANANLP_TIMEOUT_MS  = 3000; // reduced from 6000 — fail faster
const GHANANLP_FAIL_LIMIT  = 2;
function recordGhanaNLPFailure() {
  _ghanaNLPFailCount++;
  if (_ghanaNLPFailCount >= GHANANLP_FAIL_LIMIT) _ghanaNLPDisabled = true;
}
function recordGhanaNLPSuccess() {
  _ghanaNLPFailCount = 0;
}

function cacheKey(text, lang) { return `${lang}::${text.trim()}`; }

// ── Background prefetch for GhanaNLP queue items ──────────────────────────────
// Fire-and-forget: fetches items in batches of 3 so the cache is warm before
// playItem reaches each entry. Errors are silently swallowed — playItem retries.
async function prefetchQueue(items, language) {
  const BATCH = 3;
  for (let i = 0; i < items.length; i += BATCH) {
    await Promise.allSettled(
      items.slice(i, i + BATCH).map(async (item) => {
        const key = cacheKey(item.text, language);
        if (_audioCache.has(key)) return;
        try {
          const { audio, contentType } = await api.tts(item.text, language);
          const blob = base64ToBlob(audio, contentType || 'audio/wav');
          _audioCache.set(key, URL.createObjectURL(blob));
        } catch {}
      })
    );
  }
}

// ── GhanaNLP audio player ─────────────────────────────────────────────────────
async function playGhanaNLP(text, language, rate, { onStart, onEnd, onError }) {
  const key = cacheKey(text, language);

  let blobUrl = _audioCache.get(key);

  if (!blobUrl) {
    // Fetch from our backend (which calls GhanaNLP)
    const { audio, contentType } = await api.tts(text, language);
    const blob = base64ToBlob(audio, contentType || 'audio/wav');
    blobUrl    = URL.createObjectURL(blob);
    _audioCache.set(key, blobUrl);
  }

  const el        = new Audio(blobUrl);
  el.playbackRate = rate;
  el.onplay       = onStart;
  el.onended      = onEnd;
  el.onerror      = onError;

  el.play().catch(onError);

  // Return a stop/cleanup fn — do NOT revoke the URL since it's cached
  return () => { el.pause(); el.src = ''; };
}

function base64ToBlob(b64, type) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type });
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useVoiceReader() {
  const [status,   setStatus]   = useState('idle');  // 'idle' | 'loading' | 'playing' | 'paused'
  const [activeId, setActiveId] = useState(null);
  const [preview,  setPreview]  = useState('');
  const [rate,     setRateState] = useState(1.0);

  const queueRef       = useRef([]);
  const langRef        = useRef('en');
  const rateRef        = useRef(1.0);
  const activeIdxRef   = useRef(0);
  const stopCurrentRef = useRef(null);
  const cancelledRef   = useRef(false);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const cancelCurrent = useCallback(() => {
    cancelledRef.current = true;
    if (stopCurrentRef.current) { stopCurrentRef.current(); stopCurrentRef.current = null; }
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  const playItem = useCallback(async (idx) => {
    const queue = queueRef.current;
    if (cancelledRef.current || idx >= queue.length) {
      setStatus('idle'); setActiveId(null); setPreview('');
      return;
    }

    activeIdxRef.current = idx;
    const item       = queue[idx];
    const lang       = langRef.current;
    const shortPrev  = item.text.length > 90 ? item.text.slice(0, 90) + '…' : item.text;

    const onEnd   = () => { if (!cancelledRef.current) playItem(idx + 1); };
    const onError = () => { if (!cancelledRef.current) playItem(idx + 1); };

    if (GHANA_NLP_LANGS.has(lang) && !_ghanaNLPDisabled) {
      setStatus('loading');
      let timedOut = false;
      const fallbackTimer = setTimeout(() => {
        if (cancelledRef.current) return;
        timedOut = true;
        recordGhanaNLPFailure();
        playWebSpeech(item, lang, shortPrev, onEnd, onError);
      }, GHANANLP_TIMEOUT_MS);
      try {
        const cleanup = await playGhanaNLP(item.text, lang, rateRef.current, {
          onStart: () => { setStatus('playing'); setActiveId(item.id); setPreview(shortPrev); },
          onEnd,
          onError,
        });
        clearTimeout(fallbackTimer);
        if (cancelledRef.current || timedOut) { cleanup(); return; }
        recordGhanaNLPSuccess();
        stopCurrentRef.current = cleanup;
      } catch {
        clearTimeout(fallbackTimer);
        if (!timedOut) recordGhanaNLPFailure();
        if (!timedOut && !cancelledRef.current) {
          playWebSpeech(item, lang, shortPrev, onEnd, onError);
        }
      }
    } else {
      playWebSpeech(item, lang, shortPrev, onEnd, onError);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  function playWebSpeech(item, lang, shortPrev, onEnd, onError) {
    if (!supported) { onEnd(); return; }
    const u    = new SpeechSynthesisUtterance(item.text);
    const v    = pickVoice(lang);
    if (v) u.voice = v;
    u.lang     = v ? v.lang : 'en-GH';
    u.rate     = rateRef.current;
    u.pitch    = 1.0;
    u.volume   = 1.0;
    u.onstart  = () => { setStatus('playing'); setActiveId(item.id); setPreview(shortPrev); };
    u.onend    = onEnd;
    u.onerror  = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') onError(); };
    stopCurrentRef.current = () => window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  useEffect(() => () => cancelCurrent(), [cancelCurrent]);

  const speakAll = useCallback((items, lang = 'en') => {
    if (!items.length) return;
    unlockAudio();
    cancelCurrent();
    cancelledRef.current = false;
    langRef.current      = lang;
    queueRef.current     = items;
    // Pre-warm the cache for the whole queue while item 0 is playing
    if (GHANA_NLP_LANGS.has(lang) && items.length > 1) {
      setTimeout(() => prefetchQueue(items.slice(1), lang), 0);
    }
    playItem(0);
  }, [cancelCurrent, playItem]);

  const speakOne = useCallback((text, lang = 'en', id = '__single__') => {
    if (!text) return;
    unlockAudio();
    cancelCurrent();
    cancelledRef.current = false;
    langRef.current      = lang;
    queueRef.current     = [{ id, text }];
    playItem(0);
  }, [cancelCurrent, playItem]);

  const pause = useCallback(() => {
    if (supported) window.speechSynthesis.pause();
    setStatus('paused');
  }, [supported]);

  const resume = useCallback(() => {
    if (supported) window.speechSynthesis.resume();
    setStatus('playing');
  }, [supported]);

  const stop = useCallback(() => {
    cancelCurrent();
    cancelledRef.current = true;
    queueRef.current     = [];
    setStatus('idle'); setActiveId(null); setPreview('');
  }, [cancelCurrent]);

  const setRate = useCallback((r) => {
    rateRef.current = r;
    setRateState(r);
    if (status === 'playing' || status === 'loading') {
      const idx = activeIdxRef.current;
      cancelCurrent();
      cancelledRef.current = false;
      setTimeout(() => playItem(idx), 50);
    }
  }, [status, cancelCurrent, playItem]);

  return {
    status, activeId, preview, rate, rateSteps: RATE_STEPS,
    supported, speakAll, speakOne, pause, resume, stop, setRate,
  };
}
