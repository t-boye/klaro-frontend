import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getToken } from '../lib/auth';

const INACTIVE_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

export function useInactivityLogout(enabled = true) {
  const navigate = useNavigate();
  const timer    = useRef(null);

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    if (!getToken()) return;
    timer.current = setTimeout(() => {
      clearSession();
      navigate('/auth');
    }, INACTIVE_MS);
  }, [navigate]);

  useEffect(() => {
    if (!enabled) return;
    EVENTS.forEach(ev => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      EVENTS.forEach(ev => window.removeEventListener(ev, reset));
      clearTimeout(timer.current);
    };
  }, [enabled, reset]);
}
