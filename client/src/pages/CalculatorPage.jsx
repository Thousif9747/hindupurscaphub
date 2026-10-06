import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Calculator from '../components/Calculator';
import Reveal from '../components/Reveal';
import { useApp } from '../context/AppContext';

export default function CalculatorPage() {
  const { minOrderKg, t } = useApp();

  return (
    <>
      <Seo
        title="Scrap Calculator | Estimate Your Scrap Value - Hindupur Scrap Hub"
        description={`Calculate how much your scrap is worth. Live prices, running weight and minimum order ${minOrderKg} kg check.`}
        keywords="scrap calculator Hindupur, scrap rate calculator, sell scrap estimate"
      />

      <section className="container-x py-8 sm:py-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip bg-sun-50 text-sun-700 ring-1 ring-sun-200 dark:bg-sun-900/30 dark:text-sun-300 dark:ring-sun-700/50">
            {t('quickCalculator')}
          </span>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-950 sm:text-5xl dark:text-white">
            {t('sellYourScrap')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            Select items, type quantities and watch your estimate update live. A running weight bar
            shows how close you are to the {minOrderKg} kg minimum order.
          </p>
        </Reveal>

        <div className="mx-auto mt-7 grid max-w-6xl gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <Reveal>
            <Calculator />
          </Reveal>

          <Reveal delay={0.08} className="space-y-4">
            <div className="card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">How it works</h3>
              <ol className="mt-3 space-y-3 text-sm text-ink-600 dark:text-ink-300">
                {[
                  'Add every scrap item you have and enter the approximate weight.',
                  `Reach at least ${minOrderKg} kg total weight to unlock pickup and WhatsApp buttons.`,
                  'Enter your name and phone number so we can confirm the pickup.',
                  'We weigh at your doorstep and pay cash or UPI instantly.',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-moss-600 text-[11px] font-extrabold text-white">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                Good to know
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm text-ink-600 dark:text-ink-300">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                  Minimum order: {minOrderKg} kg (weight-based items only — pieces and litres are
                  excluded from the weight total).
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                  Final price depends on actual weight and quality checked at pickup.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                  Prices on this page come straight from our live rate board.
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link to="/products" className="btn-ghost text-xs">
                  {t('viewPrices')}
                </Link>
                <Link to="/contact" className="btn-dark text-xs">
                  {t('contact')}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
