import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, MessageCircle, Scale, ShieldCheck, HeartHandshake, Recycle, Timer } from 'lucide-react';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';
import MinOrderBanner from '../components/MinOrderBanner';
import { useApp } from '../context/AppContext';
import { waLink } from '../lib/format';

const values = [
  { Icon: ShieldCheck, title: 'Fair & transparent', text: 'Rates are printed on the board before we weigh. What you see is what you get.' },
  { Icon: Scale, title: 'Honest weighing', text: 'A calibrated digital scale that you can watch the entire time — nothing happens behind your back.' },
  { Icon: Timer, title: 'No waiting', text: 'Weigh, quote, pay. Most pickups finish in under ten minutes.' },
  { Icon: Recycle, title: 'Responsible recycling', text: 'Scrap is sorted and sold to registered recyclers, keeping Hindupur cleaner.' },
];

const buys = [
  { group: 'Metals', items: 'Iron, Aluminium, Copper, RM Copper, Pittal (Brass), Gun Metal, Silver' },
  { group: 'Plastic', items: 'Mixed plastic, PET bottles, containers, covers' },
  { group: 'Paper', items: 'Newspaper, cardboard, books, notebooks, white office paper' },
  { group: 'Agro', items: 'Tamarind, waste coconut, neem seeds, corn, store rice' },
  { group: 'Oil', items: 'Used cooking oil, waste lubricant oil' },
  { group: 'Others', items: 'E-waste, batteries, iron tools, machines — ask us on WhatsApp' },
];

export default function About() {
  const { settings, minOrderKg, t } = useApp();

  return (
    <>
      <Seo
        title="About Hindupur Scrap Hub | Trusted Scrap Buyer in Hindupur"
        description="Our story, values and what we buy. Hindupur Scrap Hub has been buying all kinds of scrap with honest weighing and instant payment."
        keywords="scrap dealer Hindupur, scrap buyer Andhra Pradesh, about scrap shop Hindupur"
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_450px_at_20%_-10%,#D5F5E2_0%,transparent_60%),radial-gradient(700px_350px_at_85%_0%,#FFEECB_0%,transparent_55%)] dark:bg-[radial-gradient(900px_450px_at_20%_-10%,rgba(12,89,55,0.4)_0%,transparent_60%)]" />
        <div className="container-x py-10 sm:py-16">
          <Reveal className="max-w-3xl">
            <span className="chip bg-moss-50 text-moss-700 ring-1 ring-moss-200 dark:bg-ink-900 dark:text-moss-300 dark:ring-ink-700">
              <Leaf className="h-3.5 w-3.5" /> {t('ourStory')}
            </span>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-ink-950 sm:text-6xl dark:text-white">
              Scrap buying built on <span className="text-gradient">trust</span>, not tricks
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
              Hindupur Scrap Hub began as a small family yard in Anantapur district with one rule that
              never changed: weigh everything in front of the seller and pay the same minute. That
              single habit turned a roadside shop into one of Hindupur’s most recommended scrap
              buyers.
            </p>
            <MinOrderBanner className="mt-6 max-w-xl" />
          </Reveal>
        </div>
      </section>

      <section className="container-x grid gap-6 pb-6 sm:pb-10 lg:grid-cols-3">
        {[
          { k: '8+', l: 'Years in business', d: 'Serving Hindupur households and businesses' },
          { k: '5,000+', l: 'Happy sellers', d: 'Families, shops, hostels and small industries' },
          { k: '20+', l: 'Scrap categories', d: 'From iron and copper to agro waste' },
        ].map((s, i) => (
          <Reveal key={s.l} delay={i * 0.08}>
            <div className="card p-6">
              <p className="font-display text-4xl font-extrabold text-moss-700 dark:text-moss-300">{s.k}</p>
              <p className="mt-1 text-sm font-extrabold text-ink-900 dark:text-white">{s.l}</p>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="bg-white py-12 sm:py-16 dark:bg-ink-900/40">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold text-ink-950 sm:text-4xl dark:text-white">
              {t('ourValues')}
            </h2>
            <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
              Four promises we keep on every single pickup.
            </p>
          </Reveal>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <div className="card h-full p-5 transition hover:-translate-y-1.5 hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-moss-600 to-moss-800 text-white">
                    <v.Icon className="h-[22px] w-[22px]" />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-ink-900 dark:text-white">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <Reveal>
            <span className="chip bg-sun-50 text-sun-700 ring-1 ring-sun-200 dark:bg-sun-900/30 dark:text-sun-300 dark:ring-sun-700/50">
              {t('whatWeBuy')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl dark:text-white">
              Everything with a second life
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              If you are unsure whether we take it, send a photo on WhatsApp — we reply in minutes.
            </p>
            <a
              href={waLink(settings.whatsapp, 'Hello! Do you buy this scrap? ')}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-5"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {buys.map((b, i) => (
              <Reveal key={b.group} delay={i * 0.05}>
                <div className="card h-full p-5">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-moss-600" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-moss-700 dark:text-moss-300">
                      {b.group}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{b.items}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-10">
          <div className="relative overflow-hidden rounded-[32px] bg-ink-950 p-7 text-white sm:p-10">
            <div className="hairline absolute inset-0 opacity-40" />
            <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
                  Ready to clear out your scrap?
                </h3>
                <p className="mt-2 max-w-lg text-sm text-ink-300">
                  Check today’s rates, weigh your load at home and send it to us. Minimum order{' '}
                  {minOrderKg} kg with free doorstep pickup.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-accent">
                  {t('viewPrices')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="btn border border-white/25 text-white hover:bg-white/10">
                  {t('contact')}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
