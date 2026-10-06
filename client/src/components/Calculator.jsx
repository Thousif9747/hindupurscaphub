import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Plus,
  Scale,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import api from '../lib/api';
import { useApp } from '../context/AppContext';
import { useCalculator } from '../context/CalculatorContext';
import { inr, num, waLink } from '../lib/format';

function ProgressBar({ progress }) {
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full ${
          progress >= 100
            ? 'bg-gradient-to-r from-moss-500 to-moss-700'
            : 'bg-gradient-to-r from-sun-400 to-sun-500'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
      <span className="absolute inset-0 grid place-items-center text-[10px] font-extrabold text-white mix-blend-normal">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

export default function Calculator({ showAdder = true, compact = false }) {
  const { settings, t, minOrderKg } = useApp();
  const { items, addProduct, setQty, removeItem, clear, totals, setOpen } = useCalculator();

  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/products?limit=200')
      .then((data) => alive && setCatalog(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const picked = new Set(items.map((i) => i.productId));
    return catalog
      .filter((p) => p.available && !picked.has(p._id))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 6);
  }, [catalog, query, items]);

  const validPhone = /^[0-9+\-\s]{8,16}$/.test(phone.trim());
  const detailsReady = name.trim().length >= 2 && validPhone;
  const canSubmit = totals.meetsMin && !busy;

  const summaryLines = () =>
    items
      .filter((i) => (Number(i.qty) || 0) > 0)
      .map((i) => `• ${i.name}: ${num(i.qty)} ${i.unit} × ${inr(i.price)}/${i.unit} = ${inr(i.qty * i.price, 2)}`);

  const buildMessage = () => {
    const lines = [
      'Hello Hindupur Scrap Hub, I want to sell scrap:',
      '',
      ...summaryLines(),
      '',
      `Total weight: ${totals.weightKg} kg`,
      `Estimated total: ${inr(totals.amount, 2)}`,
      `Minimum order: ${totals.min} kg`,
      '',
      `Name: ${name || '-'}`,
      `Phone: ${phone || '-'}`,
      address ? `Address: ${address}` : '',
      '',
      'Please confirm the pickup time.',
    ];
    return lines.filter(Boolean).join('\n');
  };

  const sendWhatsApp = () => {
    if (!totals.meetsMin) return;
    if (!detailsReady) {
      setStatus({
        type: 'error',
        msg: 'Enter your name and phone number so we can confirm the pickup.',
      });
      return;
    }
    window.open(waLink(settings.whatsapp || '919030924528', buildMessage()), '_blank');
  };

  const requestPickup = async () => {
    setStatus({ type: '', msg: '' });
    if (!totals.meetsMin) {
      setStatus({ type: 'error', msg: `Add ${totals.remaining} kg more to meet the ${totals.min} kg minimum.` });
      return;
    }
    if (!name.trim() || !validPhone) {
      setStatus({ type: 'error', msg: 'Please enter your name and a valid phone number.' });
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: `Estimated total ${inr(totals.amount, 2)} | ${items.length} item(s)`,
        items: items
          .filter((i) => (Number(i.qty) || 0) > 0)
          .map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: Number(i.qty),
            unit: i.unit,
            price: Number(i.price),
          })),
      };
      const res = await api.post('/pickups', payload);
      setStatus({
        type: 'success',
        msg:
          res?.message ||
          `Pickup requested for ${totals.weightKg} kg. We will call you shortly to confirm the time.`,
      });
      clear();
      setName('');
      setPhone('');
      setAddress('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-ink-100 bg-white shadow-lift dark:border-ink-800 dark:bg-ink-900 ${
        compact ? '' : ''
      }`}
    >
      <div className="relative overflow-hidden bg-ink-950 px-5 py-5 text-white sm:px-6">
        <div className="hairline absolute inset-0 opacity-40" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span className="chip bg-moss-500/20 text-moss-300 ring-1 ring-moss-500/40">
              <Scale className="h-3.5 w-3.5" />
              {t('minOrderNote', { n: minOrderKg })}
            </span>
            <h3 className="mt-2.5 font-display text-2xl font-extrabold sm:text-[26px]">
              {t('sellYourScrap')}
            </h3>
            <p className="mt-1 text-xs text-ink-400">{t('finalPriceNote')}</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-ink-300 transition hover:border-sun-400 hover:text-sun-300"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50/60 px-4 py-8 text-center dark:border-ink-700 dark:bg-ink-950/60">
            <Search className="mx-auto h-7 w-7 text-ink-300" />
            <p className="mt-3 text-sm font-semibold text-ink-600 dark:text-ink-300">
              No items yet — add what you want to sell
            </p>
            <p className="mt-1 text-xs text-ink-400">
              Try “Iron”, “Copper”, “Cardboard”…
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {items.map((it) => {
                const line = (Number(it.qty) || 0) * (Number(it.price) || 0);
                return (
                  <motion.li
                    key={it.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-3 dark:border-ink-800 dark:bg-ink-950/70"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900 dark:text-white">{it.name}</p>
                      <p className="text-[11px] font-semibold text-ink-400">
                        {inr(it.price)} / {it.unit} • {t('estimatedTotal')}: {inr(line, 2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step={it.unit === 'kg' ? '1' : '0.1'}
                        value={it.qty === 0 ? '' : it.qty}
                        placeholder="0"
                        onChange={(e) => setQty(it.productId, e.target.value)}
                        className="w-20 rounded-xl border border-ink-200 bg-white px-2.5 py-2 text-center text-sm font-bold text-ink-900 outline-none focus:border-moss-500 focus:ring-4 focus:ring-moss-500/15 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                        aria-label={`Quantity for ${it.name}`}
                      />
                      <span className="w-8 text-[11px] font-bold text-ink-400">{it.unit}</span>
                    </div>
                    <button
                      onClick={() => removeItem(it.productId)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                      aria-label={t('remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        {showAdder && (
          <div className="relative">
            <label className="label">{t('addItem')}</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="input pl-11"
              />
            </div>
            {query.trim() && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-950">
                {results.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-ink-500">No matching product.</p>
                ) : (
                  results.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => {
                        addProduct(p, 10);
                        setQuery('');
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-moss-50 dark:hover:bg-ink-900"
                    >
                      <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{p.name}</span>
                      <span className="flex items-center gap-2 text-xs font-bold text-moss-700 dark:text-moss-300">
                        {inr(p.price)}/{p.unit}
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Totals */}
        <div className="rounded-3xl bg-gradient-to-br from-moss-700 to-moss-900 p-4 text-white shadow-glow">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-moss-100">{t('totalWeight')}</span>
            <span className="font-display text-xl font-extrabold">
              {num(totals.weightKg)} <span className="text-sm font-bold text-moss-200">kg</span>
            </span>
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={totals.progress} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-moss-100/90">
              {num(totals.weightKg)} kg of {totals.min} kg {t('minOrder').toLowerCase()}
            </span>
            <span className="text-[11px] font-bold text-sun-300">
              {totals.meetsMin ? '✓ Ready' : `${num(totals.remaining)} kg to go`}
            </span>
          </div>

          <div className="mt-3 border-t border-white/15 pt-3">
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold text-moss-100">{t('estimatedTotal')}</span>
              <span className="font-display text-3xl font-extrabold text-white">{inr(totals.amount)}</span>
            </div>
            <p className="mt-1 text-[10px] text-moss-200">{t('finalPriceNote')}</p>
          </div>
        </div>

        {!totals.meetsMin && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-2xl border border-sun-200 bg-sun-50 p-3.5 dark:border-sun-700/60 dark:bg-sun-900/25"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sun-600 dark:text-sun-300" />
            <p className="text-xs font-semibold leading-relaxed text-sun-800 dark:text-sun-200">
              {totals.activeCount > 0
                ? `Add ${num(totals.remaining)} kg more to meet the ${totals.min} kg minimum order.`
                : `Minimum order is ${totals.min} kg — add items to continue.`}
            </p>
          </motion.div>
        )}
        {totals.meetsMin && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-moss-200 bg-moss-50 p-3.5 dark:border-moss-800 dark:bg-moss-900/40">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-moss-600 dark:text-moss-300" />
            <p className="text-xs font-semibold text-moss-800 dark:text-moss-200">{t('minReached')}</p>
          </div>
        )}

        {/* Customer details */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">{t('yourName')} *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ravi Kumar" className="input" />
          </div>
          <div>
            <label className="label">{t('phoneNumber')} *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="90309 24528"
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Pickup address (optional)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, landmark, Hindupur"
              className="input"
            />
          </div>
        </div>

        {totals.meetsMin && !detailsReady && (
          <p className="-mt-1 text-[11px] font-semibold text-sun-600 dark:text-sun-300">
            Add your name and phone number to unlock pickup & WhatsApp.
          </p>
        )}

        {status.msg && (
          <div
            className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-semibold ${
              status.type === 'success'
                ? 'bg-moss-50 text-moss-800 dark:bg-moss-900/40 dark:text-moss-200'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {status.msg}
          </div>
        )}

        <div className="grid gap-2.5 sm:grid-cols-2">
          <button
            onClick={requestPickup}
            disabled={!canSubmit}
            className="btn-primary w-full py-3.5"
            title={!totals.meetsMin ? `Minimum ${totals.min} kg required` : ''}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            {t('requestPickup')}
          </button>
          <button
            onClick={sendWhatsApp}
            disabled={!totals.meetsMin}
            className="btn w-full bg-[#25D366] py-3.5 text-white hover:bg-[#1EBE5B]"
            title={!totals.meetsMin ? `Minimum ${totals.min} kg required` : ''}
          >
            <MessageCircle className="h-4 w-4" />
            {t('sendOnWhatsApp')}
          </button>
        </div>

        <p className="text-center text-[10px] font-medium text-ink-400">
          {t('minOrderNote', { n: minOrderKg })} • {t('priceDisclaimer')}
        </p>
      </div>
    </div>
  );
}

export function CalculatorSheet() {
  const { open, setOpen, totals } = useCalculator();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.4 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="relative max-h-[92vh] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-white p-3 sm:max-w-lg sm:rounded-[28px] sm:p-4 dark:bg-ink-900"
          >
            <div className="sticky top-0 z-10 mb-2 flex items-center justify-between rounded-2xl bg-white/90 px-2 py-1.5 backdrop-blur dark:bg-ink-900/90">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss-100 text-moss-700 dark:bg-ink-800 dark:text-moss-300">
                <Scale className="h-[18px] w-[18px]" />
              </span>
              <span className="text-xs font-bold text-ink-500">
                {totals.activeCount} item{totals.activeCount === 1 ? '' : 's'} • {num(totals.weightKg)} kg
              </span>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200"
                aria-label="Close"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
            <Calculator />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
