import { useEffect, useState } from 'react';
import { Loader2, Save, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { useApp } from '../../context/AppContext';

const FIELDS = [
  { key: 'minOrderKg', label: 'Minimum order (kg)', type: 'number', hint: 'Enforced in calculator, pickup form and API.', half: true },
  { key: 'phone', label: 'Phone number', type: 'tel', half: true },
  { key: 'whatsapp', label: 'WhatsApp number (with country code)', type: 'text', hint: 'Example: 919030924528', half: true },
  { key: 'email', label: 'Email', type: 'email', half: true },
  { key: 'address', label: 'Shop address', type: 'text', full: true },
  { key: 'workingHours', label: 'Working hours', type: 'text', full: true },
  { key: 'shopName', label: 'Shop name (display)', type: 'text', half: true },
  { key: 'tagline', label: 'Tagline', type: 'text', half: true },
  { key: 'mapQuery', label: 'Google Maps search query', type: 'text', hint: 'Used for the map embed.', half: true },
  { key: 'instagram', label: 'Instagram URL', type: 'url', half: true },
  { key: 'facebook', label: 'Facebook URL', type: 'url', half: true },
];

export default function AdminSettings() {
  const { settings, refreshSettings } = useApp();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => setForm(settings), [settings]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: '', msg: '' });
    try {
      const res = await api.authed.put('/settings', {
        ...form,
        minOrderKg: Number(form.minOrderKg),
      });
      await refreshSettings();
      setStatus({ type: 'success', msg: res?.message || 'Settings saved and live on the site.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setBusy(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white">Settings</h1>
        <p className="text-xs text-ink-500">
          These values are stored in the database and shown across the website immediately.
        </p>
      </div>

      <section className="card p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sun-500 text-ink-950">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
              Business rules
            </h2>
            <p className="text-[11px] text-ink-400">
              Changing the minimum order updates the calculator, forms and site banners instantly.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Minimum order (kg)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100000"
                className="input pr-12"
                value={form.minOrderKg ?? ''}
                onChange={(e) => set('minOrderKg', e.target.value)}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-400">
                kg
              </span>
            </div>
            <p className="mt-1 text-[11px] text-ink-400">
              Orders below this weight are rejected by the API.
            </p>
          </div>
          <div>
            <label className="label">Phone number</label>
            <input
              className="input"
              value={form.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg font-extrabold text-ink-900 dark:text-white">
          Contact & shop details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.filter((f) => f.key !== 'minOrderKg' && f.key !== 'phone').map((f) => (
            <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
              <label className="label">{f.label}</label>
              <input
                type={f.type}
                className="input"
                value={form[f.key] ?? ''}
                onChange={(e) => set(f.key, e.target.value)}
              />
              {f.hint && <p className="mt-1 text-[11px] text-ink-400">{f.hint}</p>}
            </div>
          ))}
        </div>
      </section>

      {status.msg && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            status.type === 'success'
              ? 'bg-moss-50 text-moss-800 dark:bg-moss-900/40 dark:text-moss-200'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {status.msg}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={busy} className="btn-primary px-7 py-3.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </div>
    </form>
  );
}
