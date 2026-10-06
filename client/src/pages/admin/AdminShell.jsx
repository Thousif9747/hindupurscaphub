import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  Scale,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const nav = [
  { to: '/admin', end: true, label: 'Overview', Icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', Icon: Package },
  { to: '/admin/settings', label: 'Settings', Icon: Settings },
  { to: '/admin/inbox', label: 'Requests', Icon: Inbox },
];

export default function AdminShell({ children }) {
  const { logout, minOrderKg, token } = useApp();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-moss-600 to-moss-800 text-white">
              <Scale className="h-[18px] w-[18px]" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-extrabold text-ink-900 dark:text-white">
                Hindupur Scrap Hub
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                Admin dashboard • Min order {minOrderKg} kg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-ink-200 px-3 py-2 text-xs font-bold text-ink-600 transition hover:border-moss-300 hover:text-moss-700 sm:flex dark:border-ink-700 dark:text-ink-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> View site
            </a>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-red-600 dark:bg-white dark:text-ink-950"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-ink-100 px-3 py-2 lg:hidden dark:border-ink-800">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  isActive
                    ? 'bg-moss-600 text-white'
                    : 'border border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1.5 rounded-3xl border border-ink-100 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
            {nav.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? 'bg-moss-600 text-white shadow-[0_10px_24px_-14px_rgba(15,140,81,0.9)]'
                      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            {!token && <p className="px-4 pt-3 text-[11px] text-ink-400">Session expired.</p>}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
