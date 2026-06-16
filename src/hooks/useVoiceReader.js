import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

// Languages routed to GhanaNLP backend for real native voices:
//   tw  = Twi  (twi_speaker_4–9)
//   ewe = Ewe  (ewe_speaker_3–4)
//   fan = Fante → routed through Twi speaker (Akan dialect)
// Everything else uses Web Speech API
const GHANA_NLP_LANGS = new Set(['tw', 'ewe', 'fan']);

// Web Speech fallback voice chain per language
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

// How long to wait for GhanaNLP before falling back to Web Speech.
// 10s gives the API time to cold-start without blocking the user forever.
const GHANANLP_TIMEOUT_MS = 10000;

// ── Audio unlock ──────────────────────────────────────────────────────────────
// Must be called synchronously in a user-gesture handler (button click).
// Unlocks both AudioContext (used for GhanaNLP playback) and HTMLAudioElement
// (needed for Web Speech fallback on Safari/iOS).
let _audioUnlocked = false;
let _sharedCtx = null;

function getAudioContext() {
  if (_sharedCtx && _sharedCtx.state !== 'closed') return _sharedCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  _sharedCtx = new Ctx();
  return _sharedCtx;
}

function unlockAudio() {
  if (_audioUnlocked || typeof window === 'undefined') return;
  _audioUnlocked = true;
  try {
    const ctx = getAudioContext();
    if (ctx) {
      ctx.resume().catch(() => {});
      // Play a silent 1-sample buffer to fully unlock the context
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    }
  } catch {}
  // Also touch the HTMLAudioElement — required on Safari / some Android browsers
  try {
    const el = new Audio();
    el.muted = true;
    el.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    el.play().catch(() => {});
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

// ── GhanaNLP audio cache ──────────────────────────────────────────────────────
// Stores decoded AudioBuffer objects keyed by "lang::text".
// AudioBuffer objects can be reused across AudioContext instances.
const _audioCache = new Map();
function cacheKey(text, lang) { return `${lang}::${text.trim()}`; }

function base64ToArrayBuffer(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// ── GhanaNLP audio player ─────────────────────────────────────────────────────
// Uses AudioContext (not HTMLAudioElement) to avoid browser autoplay restrictions.
// The shared AudioContext is already unlocked via unlockAudio() in the click handler.
async function playGhanaNLP(text, language, rate, { onStart, onEnd, onError }) {
  const key = cacheKey(text, language);
  let audioBuffer = _audioCache.get(key);

  if (!audioBuffer) {
    const { audio } = await api.tts(text, language);
    const arrayBuf  = base64ToArrayBuffer(audio);
    // Decode through the shared context — no extra AudioContext created/destroyed
    const ctx = getAudioContext();
    if (!ctx) throw new Error('AudioContext not supported');
    audioBuffer = await ctx.decodeAudioData(arrayBuf);
    _audioCache.set(key, audioBuffer);
  }

  const ctx = getAudioContext();
  if (!ctx) throw new Error('AudioContext not available');
  await ctx.resume();

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = rate;
  source.connect(ctx.destination);

  let ended = false;
  source.onended = () => {
    if (!ended) { ended = true; onEnd(); }
  };

  source.start(0);
  onStart();

  return () => {
    if (!ended) {
      ended = true;
      try { source.stop(); } catch {}
    }
  };
}

// ── Background prefetch — next 3 items only ───────────────────────────────────
// Fetches and decodes the next few clips so they're ready before playItem reaches
// them. Limited to 3 so we don't fire dozens of TTS calls for long documents when
// the user might stop after the first clause.
async function prefetchQueue(items, language) {
  const ctx = getAudioContext();
  if (!ctx) return;
  await Promise.allSettled(
    items.slice(0, 3).map(async (item) => {
      const key = cacheKey(item.text, language);
      if (_audioCache.has(key)) return;
      try {
        const { audio }   = await api.tts(item.text, language);
        const audioBuffer = await ctx.decodeAudioData(base64ToArrayBuffer(audio));
        _audioCache.set(key, audioBuffer);
      } catch {}
    })
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useVoiceReader() {
  const [status,    setStatus]    = useState('idle'); // 'idle' | 'loading' | 'playing'
  const [activeId,  setActiveId]  = useState(null);
  const [preview,   setPreview]   = useState('');
  const [rate,      setRateState] = useState(1.0);

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
    const item      = queue[idx];
    const lang      = langRef.current;
    const shortPrev = item.text.length > 90 ? item.text.slice(0, 90) + '…' : item.text;

    const onEnd   = () => { if (!cancelledRef.current) playItem(idx + 1); };
    const onError = () => { if (!cancelledRef.current) playItem(idx + 1); };

    if (GHANA_NLP_LANGS.has(lang)) {
      setStatus('loading');
      let timedOut = false;

      const fallbackTimer = setTimeout(() => {
        if (cancelledRef.current) return;
        timedOut = true;
        console.warn('[voice] GhanaNLP timeout — falling back to Web Speech');
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
        stopCurrentRef.current = cleanup;
      } catch (e) {
        clearTimeout(fallbackTimer);
        console.warn('[voice] GhanaNLP error:', e.message);
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
    const u = new SpeechSynthesisUtterance(item.text);
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.lang   = v ? v.lang : 'en-GH';
    u.rate   = rateRef.current;
    u.pitch  = 1.0;
    u.volume = 1.0;
    u.onstart = () => { setStatus('playing'); setActiveId(item.id); setPreview(shortPrev); };
    u.onend   = onEnd;
    u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') onError(); };
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
