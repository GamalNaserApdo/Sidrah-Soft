import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_LANGUAGE, LANGUAGES, STORAGE_KEY, translations } from './index.js';

const I18nContext = createContext(null);

function getByPath(obj, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

function getStoredLanguage() {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && translations[stored] ? stored : null;
}

function resolveLanguage(search = '') {
  const urlLanguage = new URLSearchParams(search).get('lang');
  if (urlLanguage && translations[urlLanguage]) return urlLanguage;
  return getStoredLanguage() || DEFAULT_LANGUAGE;
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  return resolveLanguage(window.location.search);
}

export function I18nProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLang] = useState(getInitialLanguage);
  const isPublicRoute = !/^\/(cms|leads)(\/|$)/.test(location.pathname);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    if (!isPublicRoute) return;

    const params = new URLSearchParams(location.search);
    const urlLanguage = params.get('lang');
    const resolved = urlLanguage && translations[urlLanguage]
      ? urlLanguage
      : getStoredLanguage() || DEFAULT_LANGUAGE;

    if (resolved !== lang) setLang(resolved);
    if (urlLanguage !== resolved) {
      params.set('lang', resolved);
      navigate({
        pathname: location.pathname,
        search: `?${params.toString()}`,
        hash: location.hash,
      }, { replace: true });
    }
  }, [isPublicRoute, lang, location.hash, location.pathname, location.search, navigate]);

  const setLanguage = useCallback((next) => {
    if (!translations[next]) return;
    setLang(next);

    if (isPublicRoute) {
      const params = new URLSearchParams(location.search);
      params.set('lang', next);
      navigate({
        pathname: location.pathname,
        search: `?${params.toString()}`,
        hash: location.hash,
      }, { replace: true });
    }
  }, [isPublicRoute, location.hash, location.pathname, location.search, navigate]);

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
