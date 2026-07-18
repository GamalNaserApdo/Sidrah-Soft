import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES, STORAGE_KEY, translations } from './index.js';

const I18nContext = createContext(null);

function getByPath(obj, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language?.split('-')[0];
  return translations[browserLang] ? browserLang : DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLanguage = (next) => {
    if (translations[next]) setLang(next);
  };

  const t = (key, params) => {
    let value = getByPath(translations[lang], key);
    if (value == null) return key;
    if (params && typeof value === 'string') {
      value = value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '');
    }
    return value;
  };

  const value = {
    lang,
    setLanguage,
    t,
    dir: LANGUAGES[lang].dir,
    languages: LANGUAGES,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
