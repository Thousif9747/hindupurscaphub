import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { translate } from '../lib/i18n';

const FALLBACK = {
  minOrderKg: 30,
  phone: '+91 90309 24528',
  whatsapp: '919030924528',
  address: 'Main Bazaar Road, Hindupur, Anantapur, Andhra Pradesh 515201',
  workingHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 9:00 AM - 2:00 PM',
  shopName: 'Hindupur Scrap Hub',
  tagline: 'We buy your scrap at the best price',
  mapQuery: 'Hindupur, Andhra Pradesh',
  email: 'hello@hindupurscarphub.in',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
};

const AppContext = createContext(null);

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [settingsReady, setSettingsReady] = useState(false);
  const [theme, setTheme] = useState(() => read('hsh_theme', 'light'));
  const [lang, setLang] = useState(() => read('hsh_lang', 'en'));
  const [token, setToken] = useState(() => read('hsh_admin_token', ''));
  const [bootError, setBootError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/settings')
      .then((data) => {
        if (!alive) return;
        setSettings({ ...FALLBACK, ...(data || {}) });
        setSettingsReady(true);
      })
      .catch((err) => {
        if (!alive) return;
        setBootError(err.message);
        setSettingsReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    write('hsh_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang === 'te' ? 'te' : 'en';
    write('hsh_lang', lang);
  }, [lang]);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const login = useCallback((tok) => {
    setToken(tok);
    write('hsh_admin_token', tok);
  }, []);

  const logout = useCallback(() => {
    setToken('');
    write('hsh_admin_token', '');
  }, []);

  const toggleTheme = useCallback(() => setTheme((p) => (p === 'dark' ? 'light' : 'dark')), []);
  const toggleLang = useCallback(() => setLang((p) => (p === 'en' ? 'te' : 'en')), []);

  const value = useMemo(
    () => ({
      settings,
      settingsReady,
      bootError,
      refreshSettings: async () => {
        try {
          const data = await api.get('/settings');
          setSettings({ ...FALLBACK, ...(data || {}) });
        } catch {
          /* keep current */
        }
      },
      minOrderKg: Number(settings.minOrderKg) || 30,
      theme,
      toggleTheme,
      lang,
      setLang,
      toggleLang,
      t,
      token,
      login,
      logout,
      isAdmin: Boolean(token),
    }),
    [settings, settingsReady, bootError, theme, toggleTheme, lang, toggleLang, t, token, login, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export default AppContext;
