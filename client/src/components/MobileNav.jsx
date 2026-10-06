import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Info, Phone, Tags, Calculator } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCalculator } from '../context/CalculatorContext';

const items = [
  { to: '/', key: 'home', Icon: Home, end: true },
  { to: '/products', key: 'prices', Icon: Tags },
  { to: '/calculator', key: 'calculator', Icon: Calculator, primary: true },
  { to: '/about', key: 'about', Icon: Info },
  { to: '/contact', key: 'contact', Icon: Phone },
];

export default function MobileNav() {
  const { t } = useApp();
  const { totals } = useCalculator();

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-ink-100/80 bg-white/95 backdrop-blur-xl sm:hidden dark:border-ink-800 dark:bg-ink-950/95"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 items-end px-1 pb-1.5 pt-1.5">
        {items.map(({ to, key, Icon, end, primary }) => (
          <NavLink key={to} to={to} end={end} className="relative flex flex-col items-center">
            {({ isActive }) =>
              primary ? (
                <motion.span
                  whileTap={{ scale: 0.92 }}
                  className={`-mt-6 grid h-14 w-14 place-items-center rounded-full shadow-lift ring-4 ring-white transition-colors dark:ring-ink-950 ${
                    isActive ? 'bg-sun-500 text-ink-950' : 'bg-moss-700 text-white'
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                  {totals.activeCount > 0 && (
                    <span className="absolute -right-0.5 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-extrabold text-ink-950 ring-2 ring-moss-700 dark:ring-ink-950">
                      {totals.activeCount}
                    </span>
                  )}
                </motion.span>
              ) : (
                <>
                  <span
                    className={`relative grid h-9 w-full place-items-center rounded-2xl transition ${
                      isActive ? 'text-moss-700 dark:text-moss-300' : 'text-ink-500 dark:text-ink-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.9} />
                    {isActive && (
                      <motion.span
                        layoutId="mob-tab"
                        className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-moss-500 to-sun-400"
                      />
                    )}
                  </span>
                  <span
                    className={`mt-0.5 text-[10px] font-bold leading-none ${
                      isActive ? 'text-moss-700 dark:text-moss-300' : 'text-ink-400 dark:text-ink-500'
                    }`}
                  >
                    {t(key)}
                  </span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
