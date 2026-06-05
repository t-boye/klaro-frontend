import { useState, useRef, useEffect, useCallback } from 'react';

// Best BCP-47 codes for Ghanaian languages. Most browsers lack native
// voices for Twi/Ga/Ewe/Dagbani/Fante, so they fall back gracefully to
// the system default — the text is still read aloud, just phonetically.
const VOICE_LANG = {
  en:  'en-GH',
  tw:  'ak',     // Akan/Twi — limited browser support
  ga:  'en-GH',  // Ga — no standard BCP-47; fall back to English (Ghana)
  ewe: 'ee',     // Ewe — ISO code exists, partial support
  dag: 'ha',     // Dagbani — use Hausa as closest regional fallback
  ha:  'ha',     // Hausa — reasonable support on modern browsers
  fan: 'ak',     // Fante — another Akan dialect, same code
};

const RATE_STEPS = [0.75, 1, 1.25, 1.5, 2];

export function useVoiceReader() {
  const [status,    setStatus]    = useState('idle');  // 'idle' | 'playing' | 'paused'
  const [activeId,  setActiveId]  = useState(null);    // id of the item currently being spoken
  const [preview,   setPreview]   = useState('');      // short excerpt of current text
  const [rate,      setRateState] = useState(1.0);

  const queueRef = useRef([]);
  const langRef  = useRef('en');
  const rateRef  = useRef(1.0);
  const nextRef  = useRef(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // nextRef holds the recursive speaker so callbacks always have the latest version
  nextRef.current = (idx) => {
    const queue = queueRef.current;
    if (idx >= queue.length) {
      setStatus('idle');
      setActiveId(null);
      setPreview('');
      return;
    }
    const item = queue[idx];
    const u    = new SpeechSynthesisUtterance(item.text);
    u.lang     = VOICE_LANG[langRef.current] || 'en';
    u.rate     = rateRef.current;
    u.pitch    = 1.0;
    u.volume   = 1.0;

    u.onstart = () => {
      setStatus('playing');
      setActiveId(item.id);
      setPreview(item.text.length > 90 ? item.text.slice(0, 90) + '…' : item.text);
    };
    u.onend  = () => { nextRef.current?.(idx + 1); };
    u.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        nextRef.current?.(idx + 1);
      }
    };

    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    return () => { if (supported) window.speechSynthesis.cancel(); };
  }, []);

  // Speak an ordered queue of { id, text } items
  const speakAll = useCallback((items, lang = 'en') => {
    if (!supported || !items.length) return;
    window.speechSynthesis.cancel();
    langRef.current  = lang;
    queueRef.current = items;
    nextRef.current?.(0);
  }, [supported]);

  // Speak a single text snippet
  const speakOne = useCallback((text, lang = 'en', id = '__single__') => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    langRef.current  = lang;
    queueRef.current = [{ id, text }];
    nextRef.current?.(0);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus('paused');
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus('playing');
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    setStatus('idle');
    setActiveId(null);
    setPreview('');
  }, [supported]);

  // Changing rate takes effect on the next utterance in the queue.
  // If something is currently playing, the current sentence finishes at
  // the old rate, then subsequent sentences use the new rate.
  const setRate = useCallback((r) => {
    rateRef.current = r;
    setRateState(r);
  }, []);

  return {
    status, activeId, preview, rate, rateSteps: RATE_STEPS,
    supported, speakAll, speakOne, pause, resume, stop, setRate,
  };
}
