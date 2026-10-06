import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calculator, Languages, Menu, Moon, Phone, Scale, Sun, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCalculator } from '../context/CalculatorContext';
import { digits, telLink } from '../lib/format';

const links = [
  { to: '/', key: 'home' },
  { to: '/products', key: 'prices' },
  { to: '/calculator', key: 'calculator' },
  { to: '/about', key: 'about' },
  { to: '/contact', key: 'contact' },
];

export default function Header() {
  const { settings, t, theme, toggleTheme, lang, toggleLang, isAdmin } = useApp();
  const { totals } = useCalculator();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenu(false), [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-300 ${
          scrolled ? 'glass shadow-soft' : 'bg-transparent'
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-3 sm:h-[72px]">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-moss-600 to-moss-800 text-white shadow-glow transition-transform group-hover:-rotate-6">
              <Scale className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-sun-400 ring-2 ring-white dark:ring-ink-950" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-base">
                Hindupur Scrap Hub
              </span>
              <span className="hidden items-center gap-1 text-[11px] font-semibold text-moss-700 dark:text-moss-300 sm:flex">
                <Scale className="h-3 w-3" />
                {t('minOrder')}: {settings.minOrderKg || 30} kg
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'text-moss-800 dark:text-moss-300'
                      : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {t(l.key)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-moss-500 to-sun-400"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleLang}
              className="hidden h-10 items-center gap-1.5 rounded-full border border-ink-200 bg-white/70 px-3 text-xs font-bold text-ink-700 transition hover:border-moss-300 hover:text-moss-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 sm:flex"
              aria-label={t('language')}
            >
              <Languages className="h-4 w-4" />
              {lang === 'en' ? 'EN' : 'తె'}
            </button>
            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white/70 text-ink-700 transition hover:border-sun-300 hover:text-sun-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
              aria-label={t('theme')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a
              href={telLink(settings.phone)}
              className="hidden h-10 items-center gap-2 rounded-full bg-ink-900 px-4 text-xs font-bold text-white transition hover:bg-moss-700 dark:bg-white dark:text-ink-950 sm:flex"
            >
              <Phone className="h-3.5 w-3.5" />
              {digits(settings.phone).slice(-10)}
            </a>
            <button
              onClick={() => setMenu((p) => !p)}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white/70 text-ink-800 lg:hidden dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
              aria-label="Menu"
            >
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-ink-100 bg-white/95 backdrop-blur-xl lg:hidden dark:border-ink-800 dark:bg-ink-950/95"
            >
              <div className="container-x flex flex-col gap-1 py-3">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${
                        isActive
                          ? 'bg-moss-50 text-moss-800 dark:bg-ink-900 dark:text-moss-300'
                          : 'text-ink-700 dark:text-ink-200'
                      }`
                    }
                  >
                    {t(l.key)}
                  </NavLink>
                ))}
                <div className="mt-1 flex gap-2">
                  <button onClick={toggleLang} className="btn-ghost flex-1 text-xs">
                    <Languages className="h-4 w-4" />
                    {lang === 'en' ? 'English' : 'తెలుగు'}
                  </button>
                  <a href={telLink(settings.phone)} className="btn-dark flex-1 text-xs">
                    <Phone className="h-4 w-4" />
                    {t('callUs')}
                  </a>
                </div>
                {isAdmin && (
                  <Link to="/admin" className="btn-accent mt-1 text-xs">
                    Open Admin Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {totals.activeCount > 0 && (
        <Link
          to="/calculator"
          className="fixed inset-x-4 top-[76px] z-40 flex items-center justify-between rounded-2xl bg-sun-500 px-4 py-2.5 text-xs font-bold text-ink-950 shadow-lift sm:hidden"
        >
          <span className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {totals.activeCount} item{totals.activeCount > 1 ? 's' : ''} in calculator
          </span>
          <span>
            {totals.weightKg} kg • {Math.round(totals.amount)} ₹
          </span>
        </Link>
      )}
    </header>
  );
}
