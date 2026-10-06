import { Link } from 'react-router-dom';
import { Clock, Facebook, Instagram, MapPin, MessageCircle, Phone, Scale, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { telLink } from '../lib/format';

export default function Footer() {
  const { settings, t, lang, toggleLang, theme, toggleTheme } = useApp();
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Explore',
      links: [
        { to: '/', label: t('home') },
        { to: '/products', label: t('prices') },
        { to: '/calculator', label: t('calculator') },
        { to: '/about', label: t('about') },
        { to: '/contact', label: t('contact') },
      ],
    },
    {
      title: 'We buy',
      links: [
        { to: '/products?category=Metals', label: 'Metal scrap' },
        { to: '/products?category=Plastic', label: 'Plastic' },
        { to: '/products?category=Paper', label: 'Paper & cardboard' },
        { to: '/products?category=Agro', label: 'Agro waste' },
        { to: '/products?category=Oil', label: 'Waste oil' },
      ],
    },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden bg-ink-950 text-ink-200 sm:mt-24">
      <div className="hairline absolute inset-x-0 top-0 h-1.5 opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-moss-700/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-sun-600/10 blur-3xl" />

      <div className="container-x relative py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-moss-500 to-moss-800 text-white">
                <Scale className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                Hindupur Scrap Hub
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
              Your scrap deserves a fair price. Honest weighing, best rates and instant cash in
              Hindupur, Andhra Pradesh.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip bg-sun-500/15 text-sun-300 ring-1 ring-sun-500/30">
                <Scale className="h-3.5 w-3.5" />
                {t('minOrderNote', { n: settings.minOrderKg || 30 })}
              </span>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-ink-400 transition hover:translate-x-1 hover:text-moss-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-moss-400" />
                <span className="text-ink-400">{settings.address}</span>
              </li>
              <li>
                <a
                  href={telLink(settings.phone)}
                  className="flex items-center gap-2.5 text-ink-300 transition hover:text-sun-300"
                >
                  <Phone className="h-4 w-4 text-moss-400" />
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-moss-400" />
                <span className="text-ink-400">{settings.workingHours}</span>
              </li>
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-2.5 text-ink-300 transition hover:text-sun-300"
                  >
                    <Mail className="h-4 w-4 text-moss-400" />
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-5 flex gap-2">
              <a
                href={`https://wa.me/${String(settings.whatsapp || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366] transition hover:bg-[#25D366] hover:text-white"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-ink-300 transition hover:text-sun-300"
                aria-label="Instagram"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-ink-300 transition hover:text-sun-300"
                aria-label="Facebook"
              >
                <Facebook className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            © {year} Hindupur Scrap Hub. All rights reserved. Rates may change with market
            conditions and scrap quality.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-400">
            <span className="rounded-full bg-white/5 px-3 py-1.5">
              {t('minOrder')}: {settings.minOrderKg || 30} kg
            </span>
            <button onClick={toggleLang} className="rounded-full bg-white/5 px-3 py-1.5 hover:text-moss-300">
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>
            <button onClick={toggleTheme} className="rounded-full bg-white/5 px-3 py-1.5 hover:text-moss-300">
              {theme === 'dark' ? 'Light' : 'Dark'} mode
            </button>
            <Link to="/admin" className="rounded-full bg-white/5 px-3 py-1.5 hover:text-sun-300">
              {t('admin')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
