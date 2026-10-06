import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeIndianRupee,
  BadgeCheck,
  Banknote,
  Clock,
  HandCoins,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Weight,
} from 'lucide-react';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import Calculator from '../components/Calculator';
import MinOrderBanner from '../components/MinOrderBanner';
import { GridSkeleton } from '../components/Skeletons';
import api from '../lib/api';
import { useApp } from '../context/AppContext';
import { inr, num, telLink, waLink } from '../lib/format';

const steps = [
  { Icon: MessageCircle, titleKey: 'step1', descKey: 'step1d' },
  { Icon: Weight, titleKey: 'step2', descKey: 'step2d' },
  { Icon: BadgeCheck, titleKey: 'step3', descKey: 'step3d' },
  { Icon: Banknote, titleKey: 'step4', descKey: 'step4d' },
];

const reasons = [
  { Icon: Scale, title: 'Honest weighing', desc: 'Digital scale, open in front of you. No hidden deduction, no tricks.' },
  { Icon: HandCoins, title: 'Best rates', desc: 'We track the live market daily and pay the top local rate for your grade.' },
  { Icon: Sparkles, title: 'Instant cash', desc: 'Cash or UPI the moment the load is weighed. No waiting, no cheques.' },
  { Icon: Truck, title: 'Doorstep pickup', desc: 'Free pickup across Hindupur. Send a WhatsApp, we come to you.' },
];

export default function Home() {
  const { settings, t, minOrderKg } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/products?limit=8')
      .then((data) => alive && setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const ticker = useMemo(() => products.slice(0, 10), [products]);

  return (
    <>
      <Seo
        title="Hindupur Scrap Hub | Scrap Buyer in Hindupur - Best Prices & Doorstep Pickup"
        description="Sell scrap in Hindupur at the best price. Live rates for iron, copper, aluminium, paper and plastic. Minimum order 30 kg, free doorstep pickup and instant cash."
        keywords="scrap buyer in Hindupur, sell scrap Hindupur, scrap shop Hindupur, kabbu rates, instant cash scrap"
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_15%_-10%,#D5F5E2_0%,transparent_55%),radial-gradient(900px_500px_at_90%_10%,#FFEECB_0%,transparent_50%)] dark:bg-[radial-gradient(1200px_600px_at_15%_-10%,rgba(12,89,55,0.45)_0%,transparent_55%),radial-gradient(900px_500px_at_90%_10%,rgba(249,132,11,0.18)_0%,transparent_50%)]" />
        <div className="hairline absolute inset-x-0 bottom-0 h-32 opacity-30" />

        <div className="container-x relative pb-10 pt-10 sm:pb-14 sm:pt-16 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-moss-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-moss-800 shadow-soft backdrop-blur dark:border-moss-800 dark:bg-ink-900/70 dark:text-moss-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-600" />
                </span>
                Scrap buyer in Hindupur, Andhra Pradesh
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mt-5 font-display text-[2.35rem] font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-6xl lg:text-[4.1rem] dark:text-white"
              >
                Hindupur Scrap Hub — we buy your scrap at the{' '}
                <span className="text-gradient">best price</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-600 sm:text-base dark:text-ink-300"
              >
                Turn your old iron, copper, paper and plastic into cash today. Transparent live rates,
                digital weighing at your doorstep and instant payment — the way scrap buying should be.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="mt-6 rounded-2xl border border-sun-200 bg-sun-50/80 px-4 py-3 dark:border-sun-700/50 dark:bg-sun-900/25"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun-500 text-ink-950">
                    <Scale className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-sun-900 dark:text-sun-200">
                      Minimum order: {minOrderKg} kg
                    </p>
                    <p className="text-xs text-sun-700 dark:text-sun-300">
                      Final price depends on actual weight and quality of the scrap.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="mt-6 flex flex-wrap gap-3"
              >
                <Link to="/products" className="btn-primary px-6 py-3.5 text-[15px]">
                  {t('viewPrices')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={waLink(settings.whatsapp, 'Hello Hindupur Scrap Hub! I want to sell my scrap.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-[#25D366] px-6 py-3.5 text-[15px] text-white shadow-[0_14px_34px_-16px_rgba(37,211,102,0.9)] hover:-translate-y-0.5 hover:bg-[#1EBE5B]"
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  {t('whatsappUs')}
                </a>
                <a href={telLink(settings.phone)} className="btn-ghost px-5 py-3.5 text-[15px]">
                  <Phone className="h-4 w-4" />
                  {settings.phone}
                </a>
              </motion.div>

              <motion.dl
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 grid max-w-lg grid-cols-3 gap-3"
              >
                {[
                  { k: '20+', v: 'Scrap categories' },
                  { k: '0₹', v: 'Pickup charge' },
                  { k: '<10m', v: 'To get paid' },
                ].map((s) => (
                  <div
                    key={s.v}
                    className="rounded-2xl border border-ink-100 bg-white/70 px-3 py-3 text-center backdrop-blur dark:border-ink-800 dark:bg-ink-900/60"
                  >
                    <dt className="font-display text-xl font-extrabold text-moss-700 dark:text-moss-300">
                      {s.k}
                    </dt>
                    <dd className="text-[10px] font-bold uppercase tracking-wide text-ink-500">{s.v}</dd>
                  </div>
                ))}
              </motion.dl>
            </div>

            {/* Hero visual: floating live rate cards */}
            <div className="relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative rounded-[32px] border border-ink-100 bg-white p-5 shadow-lift dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="flex items-center justify-between">
                  <span className="chip bg-moss-50 text-moss-700 ring-1 ring-moss-200 dark:bg-ink-800 dark:text-moss-300 dark:ring-ink-700">
                    <BadgeIndianRupee className="h-3.5 w-3.5" /> Today’s board
                  </span>
                  <span className="text-[11px] font-bold text-ink-400">Live rates</span>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {(loading ? Array.from({ length: 5 }) : products.slice(0, 5)).map((p, i) => (
                    <li
                      key={p?._id || i}
                      className="flex items-center justify-between rounded-2xl border border-ink-100 bg-ink-50/70 px-4 py-3 dark:border-ink-800 dark:bg-ink-950/70"
                    >
                      <span className="text-sm font-bold text-ink-800 dark:text-ink-100">
                        {p?.name || 'Loading…'}
                      </span>
                      <span className="font-display text-lg font-extrabold text-moss-700 dark:text-moss-300">
                        {p ? `${inr(p.price)}/${p.unit}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink-950 px-4 py-3 text-white">
                  <span className="text-xs font-bold text-ink-300">Minimum order</span>
                  <span className="font-display text-lg font-extrabold text-sun-300">{minOrderKg} kg</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-14 -top-12 z-10 rounded-3xl border border-ink-100 bg-white px-4 py-3 shadow-lift dark:border-ink-800 dark:bg-ink-900"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">Paid instantly</p>
                <p className="font-display text-xl font-extrabold text-moss-700 dark:text-moss-300">
                  Cash / UPI
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute -bottom-12 -right-6 z-10 rounded-3xl border border-ink-100 bg-sun-50 px-4 py-3 shadow-lift dark:border-ink-700 dark:bg-ink-900"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-sun-700 dark:text-sun-300">
                  Doorstep pickup
                </p>
                <p className="font-display text-xl font-extrabold text-ink-900 dark:text-white">Free</p>
              </motion.div>
            </div>
          </div>

          <MinOrderBanner className="mt-8" />
        </div>

        {/* price ticker */}
        <div className="relative overflow-hidden border-y border-ink-100 bg-white/70 py-3 backdrop-blur dark:border-ink-800 dark:bg-ink-900/60">
          <div className="flex w-max animate-marquee gap-8">
            {[...ticker, ...ticker].map((p, i) => (
              <span key={`${p._id}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-xs font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-moss-500" />
                <span className="text-ink-700 dark:text-ink-200">{p.name}</span>
                <span className="text-moss-700 dark:text-moss-300">
                  {inr(p.price)}/{p.unit}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE PRICES */}
      <section className="container-x py-12 sm:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="chip bg-moss-50 text-moss-700 ring-1 ring-moss-200 dark:bg-ink-900 dark:text-moss-300 dark:ring-ink-700">
              <Scale className="h-3.5 w-3.5" /> {t('livePrices')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl dark:text-white">
              Today’s scrap rates
            </h2>
            <p className="mt-2 max-w-lg text-sm text-ink-500 dark:text-ink-400">
              Updated from the market board at our shop. {t('priceDisclaimer')}
            </p>
          </div>
          <Link to="/products" className="btn-dark">
            {t('seeAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-7">
          {loading ? (
            <GridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="relative overflow-hidden bg-white py-12 sm:py-16 dark:bg-ink-900/40">
        <div className="hairline absolute inset-x-0 top-0 h-16 opacity-30" />
        <div className="container-x grid items-start gap-8 lg:grid-cols-[1fr,1.05fr]">
          <Reveal>
            <span className="chip bg-sun-50 text-sun-700 ring-1 ring-sun-200 dark:bg-sun-900/30 dark:text-sun-300 dark:ring-sun-700/50">
              <Sparkles className="h-3.5 w-3.5" /> {t('quickCalculator')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl dark:text-white">
              {t('sellYourScrap')}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              Add the scrap you have at home, enter approximate quantities and see exactly how much
              you will earn — live, before anyone reaches your door.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                { icon: Weight, text: `Minimum order: ${minOrderKg} kg across all items` },
                { icon: ShieldCheck, text: 'Final price depends on actual weight and quality' },
                { icon: Clock, text: 'Pickup scheduled within the same day where possible' },
                { icon: BadgeIndianRupee, text: 'Estimated total updates as you type' },
              ].map((li, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-ink-700 dark:text-ink-200">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-moss-50 text-moss-700 dark:bg-ink-800 dark:text-moss-300">
                    <li.icon className="h-4 w-4" />
                  </span>
                  {li.text}
                </li>
              ))}
            </ul>

            <Link to="/calculator" className="btn-ghost mt-6">
              Open full calculator <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <Calculator />
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-x py-12 sm:py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip bg-moss-50 text-moss-700 ring-1 ring-moss-200 dark:bg-ink-900 dark:text-moss-300 dark:ring-ink-700">
            4 simple steps
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl dark:text-white">
            {t('howItWorks')}
          </h2>
        </Reveal>

        <div className="relative mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent lg:block dark:via-ink-700" />
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} className="relative">
              <div className="card h-full p-5 transition-transform duration-300 hover:-translate-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-moss-600 to-moss-800 text-white shadow-glow">
                    <s.Icon className="h-[22px] w-[22px]" />
                  </span>
                  <span className="font-display text-4xl font-extrabold text-ink-100 dark:text-ink-800">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-ink-900 dark:text-white">
                  {t(s.titleKey)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {t(s.descKey)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative overflow-hidden bg-ink-950 py-14 text-white sm:py-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-moss-700/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-sun-600/15 blur-3xl" />
        <div className="container-x relative">
          <Reveal className="max-w-2xl">
            <span className="chip bg-white/10 text-moss-300 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" /> {t('whyChooseUs')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Built on trust, weighed in the open
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">
              Families, shops, hostels and factories across Hindupur sell to us because nothing is
              hidden — from the rate board to the weighing scale.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.07}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-moss-400/40 hover:bg-white/[0.08]">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun-500 text-ink-950 transition-transform group-hover:-rotate-6">
                    <r.Icon className="h-[22px] w-[22px]" />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="container-x grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2">
        <Reveal>
          <span className="chip bg-moss-50 text-moss-700 ring-1 ring-moss-200 dark:bg-ink-900 dark:text-moss-300 dark:ring-ink-700">
            {t('ourStory')}
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl dark:text-white">
            A neighbourhood scrap shop that grew on fairness
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            Hindupur Scrap Hub started as a small yard and grew because we never bargained on
            weighing. Today we buy 20+ kinds of scrap — metals, plastic, paper, agro waste and used
            oil — from households, kirana stores, hostel messes and small industries around Hindupur.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { v: '8+', l: 'Years' },
              { v: '5k+', l: 'Happy sellers' },
              { v: '20+', l: 'Scrap types' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-ink-100 bg-white p-3 text-center dark:border-ink-800 dark:bg-ink-900">
                <p className="font-display text-2xl font-extrabold text-moss-700 dark:text-moss-300">{s.v}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">{s.l}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-dark mt-6">
            More about us <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-[32px] border border-ink-100 bg-gradient-to-br from-moss-700 via-moss-800 to-ink-950 p-7 text-white shadow-lift dark:border-ink-800">
            <div className="hairline absolute inset-0 opacity-30" />
            <div className="relative">
              <span className="chip bg-white/10 text-moss-200 ring-1 ring-white/15">
                <MapPin className="h-3.5 w-3.5" /> Visit our yard
              </span>
              <p className="mt-4 font-display text-xl font-bold leading-snug">{settings.address}</p>
              <p className="mt-3 text-sm text-moss-100/90">
                <Clock className="mr-1.5 inline h-4 w-4" />
                {settings.workingHours}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <a href={telLink(settings.phone)} className="btn bg-white px-5 py-3 text-ink-950 hover:bg-moss-50">
                  <Phone className="h-4 w-4" /> {t('callUs')}
                </a>
                <a
                  href={waLink(settings.whatsapp, 'Hello! I want to schedule a scrap pickup.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-[#25D366] px-5 py-3 text-white hover:bg-[#1EBE5B]"
                >
                  <MessageCircle className="h-4 w-4" /> {t('bookPickup')}
                </a>
                <Link to="/contact" className="btn border border-white/25 px-5 py-3 text-white hover:bg-white/10">
                  Contact page
                </Link>
              </div>
              <p className="mt-5 text-xs font-semibold text-sun-300">
                {t('minOrderNote', { n: minOrderKg })} • {t('finalPriceNote')}
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
