import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('klaro_cookie_consent')) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('klaro_cookie_consent', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
          Klaro uses cookies to keep you signed in and improve your experience. By continuing, you agree to our{' '}
          <Link to="/privacy" className="underline text-brand-600 dark:text-brand-400">Privacy Policy</Link>.
          &nbsp;(Ghana Data Protection Act, Act 843)
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={accept} className="btn-primary text-sm px-5 py-2">Accept</button>
        </div>
      </div>
    </div>
  );
}
