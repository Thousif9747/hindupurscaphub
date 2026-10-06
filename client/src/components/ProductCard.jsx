import { motion } from 'framer-motion';
import { Droplets, IndianRupee, Newspaper, Package, Plus, Recycle, Sprout, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCalculator } from '../context/CalculatorContext';
import { formatDate, inr, num } from '../lib/format';

export const CATEGORY_ICON = {
  Metals: Wrench,
  Plastic: Recycle,
  Paper: Newspaper,
  Agro: Sprout,
  Oil: Droplets,
  Others: Package,
};

export const CATEGORY_COLOR = {
  Metals: 'bg-ink-900 text-white dark:bg-white dark:text-ink-950',
  Plastic: 'bg-moss-100 text-moss-800 dark:bg-moss-900/60 dark:text-moss-200',
  Paper: 'bg-sun-100 text-sun-800 dark:bg-sun-900/50 dark:text-sun-200',
  Agro: 'bg-moss-50 text-moss-700 dark:bg-ink-800 dark:text-moss-300',
  Oil: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
  Others: 'bg-ink-50 text-ink-600 dark:bg-ink-900 dark:text-ink-300',
};

export default function ProductCard({ product, index = 0, compact = false }) {
  const { t } = useApp();
  const { addProduct, items, setOpen } = useCalculator();
  const Icon = CATEGORY_ICON[product.category] || Package;
  const inCalc = items.some((i) => i.productId === product._id && (Number(i.qty) || 0) > 0);

  const handleSell = () => {
    addProduct(product, 10);
    setOpen(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft transition-shadow hover:shadow-lift dark:border-ink-800 dark:bg-ink-900 ${
        product.available ? '' : 'opacity-70'
      }`}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-moss-500 via-moss-300 to-sun-400 opacity-70" />

      <div className={`flex items-start justify-between gap-2 p-4 ${compact ? 'pb-2' : 'pb-3'}`}>
        <div className="flex items-center gap-3">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
              CATEGORY_COLOR[product.category] || CATEGORY_COLOR.Others
            }`}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="h-7 w-7 rounded-lg object-cover"
              />
            ) : (
              <Icon className="h-5 w-5" strokeWidth={2} />
            )}
          </span>
          <div>
            <h3 className="text-[15px] font-extrabold leading-tight text-ink-900 dark:text-white">
              {product.name}
            </h3>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              {product.category}
            </span>
          </div>
        </div>
        {!product.available && (
          <span className="chip bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300">Paused</span>
        )}
      </div>

      <div className="px-4">
        <div className="flex items-end gap-1.5">
          <span className="font-display text-3xl font-extrabold leading-none text-ink-900 dark:text-white">
            {inr(product.price)}
          </span>
          <span className="pb-0.5 text-xs font-bold text-ink-400">
            / {num(1)} {product.unit}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
          {product.description || 'Quality checked scrap, weighed openly in front of you.'}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 p-4 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
          {t('lastUpdated')}: {formatDate(product.updatedAt)}
        </span>
        <button
          onClick={handleSell}
          disabled={!product.available}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
            inCalc
              ? 'bg-moss-600 text-white shadow-[0_8px_20px_-10px_rgba(15,140,81,0.9)]'
              : 'bg-ink-900 text-white hover:bg-moss-700 dark:bg-white dark:text-ink-950 dark:hover:bg-moss-500'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Plus className="h-3.5 w-3.5" />
          {inCalc ? 'Added' : t('sellThis')}
        </button>
      </div>

      {inCalc && (
        <span className="absolute -right-6 top-4 rotate-45 bg-moss-600 px-7 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
          In cart
        </span>
      )}
    </motion.article>
  );
}
