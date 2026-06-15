import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLang, setLang as saveLang, t as translate, SUPPORTED_LANGS } from '../lib/i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(getLang);

  useEffect(() => {
    function onLangChange(e) { setLangState(e.detail); }
    window.addEventListener('klaro_lang_change', onLangChange);
    return () => window.removeEventListener('klaro_lang_change', onLangChange);
  }, []);

  function setLang(code) {
    saveLang(code);
    setLangState(code);
  }

  function t(path) {
    return translate(path, lang);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, SUPPORTED_LANGS }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
