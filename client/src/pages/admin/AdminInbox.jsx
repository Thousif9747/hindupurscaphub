import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Inbox, Loader2, MessageCircle, Phone, RefreshCw, Trash2, Truck } from 'lucide-react';
import api from '../../lib/api';
import { inr, relTime, telLink, waLink } from '../../lib/format';

const PICKUP_STATUS = ['new', 'scheduled', 'done', 'cancelled'];
const ENQUIRY_STATUS = ['new', 'contacted', 'closed'];

export default function AdminInbox() {
  const [tab, setTab] = useState('pickups');
  const [pickups, setPickups] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [k, e] = await Promise.all([api.authed.get('/pickups'), api.authed.get('/enquiries')]);
      setPickups(k || []);
      setEnquiries(e || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setPickupStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await api.authed.put(`/pickups/${id}/status`, { status });
      setPickups((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const setEnquiryStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await api.authed.put(`/enquiries/${id}/status`, { status });
      setEnquiries((prev) => prev.map((e) => (e._id === id ? updated : e)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const delPickup = async (id) => {
    if (!window.confirm('Delete this pickup request?')) return;
    try {
      await api.authed.del(`/pickups/${id}`);
      setPickups((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const delEnquiry = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await api.authed.del(`/enquiries/${id}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const counts = {
    pickups: pickups.filter((p) => p.status === 'new').length,
    enquiries: enquiries.filter((e) => e.status === 'new').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white">Requests</h1>
          <p className="text-xs text-ink-500">Pickup requests and enquiries sent from the website.</p>
        </div>
        <button onClick={load} className="btn-ghost text-xs">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'pickups', label: 'Pickup requests', Icon: Truck, count: counts.pickups },
          { id: 'enquiries', label: 'Enquiries', Icon: Inbox, count: counts.enquiries },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition ${
              tab === tb.id
                ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950'
                : 'border border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300'
            }`}
          >
            <tb.Icon className="h-3.5 w-3.5" />
            {tb.label}
            {tb.count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sun-500 px-1 text-[10px] font-extrabold text-ink-950">
                {tb.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 w-full rounded-3xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {tab === 'pickups' &&
              (pickups.length === 0 ? (
                <Empty icon={<Truck className="h-8 w-8" />} text="No pickup requests yet." />
              ) : (
                pickups.map((p) => (
                  <div key={p._id} className="card p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                          {p.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {relTime(p.createdAt)} • {p.items?.length || 0} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={p.status}
                          disabled={busyId === p._id}
                          onChange={(e) => setPickupStatus(p._id, e.target.value)}
                          className="rounded-full border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 outline-none dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200"
                        >
                          {PICKUP_STATUS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => delPickup(p._id)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-400 transition hover:border-red-400 hover:text-red-500 dark:border-ink-700"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-ink-50 px-3.5 py-3 dark:bg-ink-950/70">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                          Total weight
                        </p>
                        <p className="font-display text-xl font-extrabold text-moss-700 dark:text-moss-300">
                          {p.totalWeight} kg
                        </p>
                      </div>
                      <div className="rounded-2xl bg-ink-50 px-3.5 py-3 dark:bg-ink-950/70">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                          Estimated total
                        </p>
                        <p className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
                          {inr(p.estimatedTotal)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-ink-50 px-3.5 py-3 dark:bg-ink-950/70">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                          Phone
                        </p>
                        <a
                          href={telLink(p.phone)}
                          className="font-display text-lg font-extrabold text-sun-600 hover:underline"
                        >
                          {p.phone}
                        </a>
                      </div>
                    </div>

                    <ul className="mt-3 flex flex-wrap gap-2">
                      {(p.items || []).map((it, i) => (
                        <li
                          key={i}
                          className="rounded-full border border-ink-200 px-3 py-1.5 text-[11px] font-bold text-ink-600 dark:border-ink-700 dark:text-ink-300"
                        >
                          {it.name} — {it.quantity} {it.unit}
                        </li>
                      ))}
                    </ul>

                    {p.address && (
                      <p className="mt-3 text-xs text-ink-500">
                        <span className="font-bold text-ink-700 dark:text-ink-300">Address:</span> {p.address}
                      </p>
                    )}
                    {p.note && <p className="mt-1 text-xs text-ink-400">Note: {p.note}</p>}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={telLink(p.phone)} className="btn-dark py-2.5 text-xs">
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                      <a
                        href={waLink(p.phone, `Hello ${p.name}, this is Hindupur Scrap Hub regarding your pickup request of ${p.totalWeight} kg.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn bg-[#25D366] py-2.5 text-xs text-white hover:bg-[#1EBE5B]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>
                ))
              ))}

            {tab === 'enquiries' &&
              (enquiries.length === 0 ? (
                <Empty icon={<Inbox className="h-8 w-8" />} text="No enquiries yet." />
              ) : (
                enquiries.map((e) => (
                  <div key={e._id} className="card p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
                          {e.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {e.phone} • {relTime(e.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={e.status}
                          disabled={busyId === e._id}
                          onChange={(e2) => setEnquiryStatus(e._id, e2.target.value)}
                          className="rounded-full border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 outline-none dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200"
                        >
                          {ENQUIRY_STATUS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => delEnquiry(e._id)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-400 transition hover:border-red-400 hover:text-red-500 dark:border-ink-700"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <p className="rounded-2xl bg-ink-50 px-3.5 py-2.5 text-ink-700 dark:bg-ink-950/70 dark:text-ink-300">
                        <span className="font-bold">Scrap type:</span> {e.scrapType || '—'}
                      </p>
                      <p className="rounded-2xl bg-ink-50 px-3.5 py-2.5 text-ink-700 dark:bg-ink-950/70 dark:text-ink-300">
                        <span className="font-bold">Quantity:</span> {e.quantity || '—'}
                      </p>
                    </div>
                    {e.message && (
                      <p className="mt-3 rounded-2xl border border-ink-100 bg-white px-3.5 py-3 text-sm text-ink-600 dark:border-ink-800 dark:bg-ink-950/60 dark:text-ink-300">
                        {e.message}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={telLink(e.phone)} className="btn-dark py-2.5 text-xs">
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                      <a
                        href={waLink(e.phone, `Hello ${e.name}, this is Hindupur Scrap Hub replying to your enquiry.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn bg-[#25D366] py-2.5 text-xs text-white hover:bg-[#1EBE5B]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>
                ))
              ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-ink-50 text-ink-300 dark:bg-ink-800">
        {icon}
      </span>
      <p className="mt-3 text-sm font-semibold text-ink-500">{text}</p>
    </div>
  );
}
