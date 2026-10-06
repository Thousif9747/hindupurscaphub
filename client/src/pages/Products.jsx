import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Scale, PackageOpen, X } from 'lucide-react';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';
import ProductCard, { CATEGORY_ICON } from '../components/ProductCard';
import MinOrderBanner from '../components/MinOrderBanner';
import { GridSkeleton } from '../components/Skeletons';
import api from '../lib/api';
import { useApp } from '../context/AppContext';

const TABS = ['All', 'Metals', 'Plastic', 'Paper', 'Agro', 'Oil', 'Others'];

export default function Products() {
  const { t, minOrderKg } = useApp();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const category = params.get('category') || 'All';

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const query = new URLSearchParams();
    if (category !== 'All') query.set('category', category);
    if (search.trim()) query.set('search', search.trim());
    query.set('limit', '200');

    api
      .get(`/products?${query.toString()}`)
      .then((data) => {
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [category, search]);

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === 'All') next.delete('category');
    else next.set('category', c);
    setParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const map = { All: products.length };
    return map;
  }, [products]);

  return (
    <>
      <Seo
        title="Scrap Prices in Hindupur | Live Rates - Hindupur Scrap Hub"
        description={`Live scrap prices for iron, copper, aluminium, plastic, paper and agro waste in Hindupur. Minimum order ${minOrderKg} kg with free doorstep pickup.`}
        keywords="scrap prices Hindupur, iron rate Hindupur, copper price Hindupur, sell scrap Hindupur, kabbu rates Hindupur"
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_80%_-20%,#D5F5E2_0%,transparent_60%),radial-gradient(700px_300px_at_5%_0%,#FFEECB_0%,transparent_55%)] dark:bg-[radial-gradient(900px_400px_at_80%_-20%,rgba(12,89,55,0.4)_0%,transparent_60%)]" />
        <div className="container-x pb-4 pt-8 sm:pt-12">
          <Reveal>
            <span className="chip bg-moss-50 text-moss-700 ring-1 ring-moss-200 dark:bg-ink-900 dark:text-moss-300 dark:ring-ink-700">
              <Scale className="h-3.5 w-3.5" /> Updated today
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-5xl dark:text-white">
              Products & prices
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink-500 dark:text-ink-400">
              Pick what you have, add it to the calculator and see your estimate instantly.
            </p>
          </Reveal>

          <MinOrderBanner className="mt-5" />
        </div>
      </section>

      {/* Search + tabs */}
      <div className="sticky top-16 z-30 border-b border-ink-100 bg-white/85 backdrop-blur-xl sm:top-[72px] dark:border-ink-800 dark:bg-ink-950/85">
        <div className="container-x py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="input pl-11 pr-10"
              aria-label="Search products"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="no-scrollbar -mx-1 mt-2.5 flex gap-2 overflow-x-auto px-1 pb-1">
            {TABS.map((c) => {
              const Icon = CATEGORY_ICON[c];
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                    active
                      ? 'text-white'
                      : 'border border-ink-200 bg-white text-ink-600 hover:border-moss-300 hover:text-moss-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="cat-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-moss-700 to-moss-500"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {c === 'All' ? t('all') : c}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="container-x py-6 sm:py-10">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-ink-500">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {products.length} item{products.length === 1 ? '' : 's'}
            {category !== 'All' && ` in ${category}`}
            {counts.All !== undefined && !loading && ` • ${counts.All} shown`}
          </span>
          <span className="hidden sm:block">{t('priceDisclaimer')}</span>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <GridSkeleton count={9} />
        ) : products.length === 0 ? (
          <div className="card grid place-items-center px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-ink-50 text-ink-300 dark:bg-ink-800">
              <PackageOpen className="h-8 w-8" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-ink-900 dark:text-white">No products found</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Try a different search or category. Need something special? WhatsApp us — we buy 20+
              scrap types.
            </p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn-primary mt-5">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
