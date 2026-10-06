import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MinOrderBanner({ tone = 'light', className = '' }) {
  const { minOrderKg, t } = useApp();
  const dark = tone === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'flex flex-wrap items-center justify-center gap-2 rounded-full px-4 py-2.5 text-center text-xs font-semibold sm:text-sm',
        dark
          ? 'bg-white/10 text-moss-100 ring-1 ring-white/15'
          : 'bg-sun-50 text-sun-800 ring-1 ring-sun-200 dark:bg-sun-900/30 dark:text-sun-200 dark:ring-sun-700/50',
        className,
      ].join(' ')}
    >
      <Scale className="h-4 w-4 shrink-0" />
      <span>
        {t('minOrderNote', { n: minOrderKg })} • {t('finalPriceNote')}
      </span>
    </motion.div>
  );
}
