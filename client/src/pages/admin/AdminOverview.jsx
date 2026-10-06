import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bell, Package, Scale, Truck } from 'lucide-react';
import api from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { inr, relTime } from '../../lib/format';

export default function AdminOverview() {
  const { minOrderKg } = useApp();
  const [stats, setStats] = useState({ products: 0, enquiries: [], pickups: [] });

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      api.authed.get('/products?all=true&limit=500'),
      api.authed.get('/enquiries'),
      api.authed.get('/pickups'),
    ]).then(([p, e, k]) => {
      if (!alive) return;
      setStats({
        products: p.status === 'fulfilled' ? (p.value?.length ?? 0) : 0,
        enquiries: e.status === 'fulfilled' ? e.value ?? [] : [],
        pickups: k.status === 'fulfilled' ? k.value ?? [] : [],
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  const newPickups = stats.pickups.filter((p) => p.status === 'new').length;
  const newEnquiries = stats.enquiries.filter((e) => e.status === 'new').length;
  const recent = [...stats.pickups.slice(0, 4)];

  const cards = [
    { label: 'Products', value: stats.products, Icon: Package, to: '/admin/products', tone: 'bg-moss-600' },
    { label: 'Pickup requests', value: stats.pickups.length, sub: `${newPickups} new`, Icon: Truck, to: '/admin/inbox', tone: 'bg-sun-500 text-ink-950' },
    { label: 'Enquiries', value: stats.enquiries.length, sub: `${newEnquiries} new`, Icon: Bell, to: '/admin/inbox', tone: 'bg-ink-900 dark:bg-white dark:text-ink-950' },
    { label: 'Minimum order', value: `${minOrderKg} kg`, Icon: Scale, to: '/admin/settings', tone: 'bg-moss-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="card group p-5 transition hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex items-start justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl text-white ${c.tone}`}>
                <c.Icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-300 transition group-hover:text-moss-600" />
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-ink-900 dark:text-white">
              {c.value}
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{c.label}</p>
            {c.sub && <p className="mt-1 text-[11px] font-bold text-sun-600">{c.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
              Latest pickup requests
            </h2>
            <Link to="/admin/inbox" className="text-xs font-bold text-moss-700 hover:underline dark:text-moss-300">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5">
            {recent.length === 0 && (
              <li className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-xs text-ink-400 dark:border-ink-700">
                No pickup requests yet.
              </li>
            )}
            {recent.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 px-4 py-3 dark:border-ink-800 dark:bg-ink-950/70"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-900 dark:text-white">
                    {p.name} • {p.totalWeight} kg
                  </p>
                  <p className="truncate text-[11px] text-ink-400">
                    {p.phone} • {relTime(p.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-moss-700 dark:text-moss-300">
                  {inr(p.estimatedTotal)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
              Latest enquiries
            </h2>
            <Link to="/admin/inbox" className="text-xs font-bold text-moss-700 hover:underline dark:text-moss-300">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5">
            {stats.enquiries.length === 0 && (
              <li className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-xs text-ink-400 dark:border-ink-700">
                No enquiries yet.
              </li>
            )}
            {stats.enquiries.slice(0, 5).map((e) => (
              <li
                key={e._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 px-4 py-3 dark:border-ink-800 dark:bg-ink-950/70"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-900 dark:text-white">
                    {e.name} • {e.phone}
                  </p>
                  <p className="truncate text-[11px] text-ink-400">
                    {e.scrapType || 'General'} {e.quantity ? `• ${e.quantity}` : ''} •{' '}
                    {relTime(e.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                    e.status === 'new'
                      ? 'bg-sun-100 text-sun-800 dark:bg-sun-900/50 dark:text-sun-200'
                      : 'bg-moss-100 text-moss-800 dark:bg-moss-900/60 dark:text-moss-200'
                  }`}
                >
                  {e.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
