import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate, inr } from '../../lib/format';

const CATEGORIES = ['Metals', 'Plastic', 'Paper', 'Agro', 'Oil', 'Others'];
const UNITS = ['kg', 'gram', 'piece', 'litre', 'dozen', 'bag'];

const empty = {
  name: '',
  category: 'Metals',
  price: '',
  unit: 'kg',
  description: '',
  image: '',
  available: true,
};

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-moss-600' : 'bg-ink-200 dark:bg-ink-700'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [modal, setModal] = useState(null); // {mode:'create'|'edit', form}
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.authed.get('/products?all=true&limit=500');
      setProducts(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.status === 401) {
        localStorage.removeItem('hsh_admin_token');
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === 'All' || p.category === cat) &&
        (!s || p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s))
    );
  }, [products, q, cat]);

  const quickSave = async (p, patch) => {
    setSavingId(p._id);
    try {
      const updated = await api.authed.put(`/products/${p._id}`, patch);
      setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, ...updated } : x)));
      flash(`“${p.name}” updated — live on the site now.`);
    } catch (err) {
      flash(err.message);
    } finally {
      setSavingId('');
    }
  };

  const openCreate = () => setModal({ mode: 'create', form: { ...empty } });
  const openEdit = (p) =>
    setModal({
      mode: 'edit',
      form: {
        _id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        unit: p.unit,
        description: p.description || '',
        image: p.image || '',
        available: p.available,
      },
    });

  const submitModal = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const f = modal.form;
      const payload = new FormData();
      payload.append('name', f.name);
      payload.append('category', f.category);
      payload.append('price', String(f.price));
      payload.append('unit', f.unit);
      payload.append('description', f.description || '');
      payload.append('available', String(f.available));
      if (f.imageFile) payload.append('imageFile', f.imageFile);
      else if (f.image) payload.append('image', f.image);

      if (modal.mode === 'create') {
        await api.authed.post('/products', payload);
        flash(`“${f.name}” added.`);
      } else {
        await api.authed.put(`/products/${f._id}`, payload);
        flash(`“${f.name}” updated.`);
      }
      setModal(null);
      await load();
    } catch (err) {
      flash(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.name}”? This removes it from the site.`)) return;
    try {
      await api.authed.del(`/products/${p._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
      flash(`“${p.name}” deleted.`);
    } catch (err) {
      flash(err.message);
    }
  };

  const setField = (k, v) => setModal((m) => ({ ...m, form: { ...m.form, [k]: v } }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 dark:text-white">Products</h1>
          <p className="text-xs text-ink-500">
            Edit price, unit and availability inline — changes appear on the public site instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-xs">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={openCreate} className="btn-primary text-xs">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="input pl-10"
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                cat === c
                  ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950'
                  : 'border border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-3xl border border-ink-100 bg-white lg:block dark:border-ink-800 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-[11px] uppercase tracking-wide text-ink-400 dark:bg-ink-950/60">
            <tr>
              <th className="px-5 py-3 font-bold">Product</th>
              <th className="px-3 py-3 font-bold">Category</th>
              <th className="px-3 py-3 font-bold">Price (₹)</th>
              <th className="px-3 py-3 font-bold">Unit</th>
              <th className="px-3 py-3 font-bold">Available</th>
              <th className="px-3 py-3 font-bold">Updated</th>
              <th className="px-5 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-5 py-4">
                    <div className="skeleton h-5 w-full" />
                  </td>
                </tr>
              ))}
            {!loading &&
              filtered.map((p) => (
                <tr key={p._id} className="transition hover:bg-ink-50/70 dark:hover:bg-ink-950/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-100 text-ink-400 dark:bg-ink-800">
                        {p.image ? (
                          <img src={p.image} alt="" className="h-9 w-9 object-cover" loading="lazy" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink-900 dark:text-white">{p.name}</p>
                        <p className="truncate text-[11px] text-ink-400">
                          {p.description?.slice(0, 46) || 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold text-ink-500">{p.category}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.price}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v) && v !== p.price) quickSave(p, { price: v });
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                      className="w-24 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-extrabold text-ink-900 outline-none focus:border-moss-500 focus:ring-4 focus:ring-moss-500/15 dark:border-ink-700 dark:bg-ink-950 dark:text-white"
                      aria-label={`Price for ${p.name}`}
                    />
                    <span className="ml-1 text-[11px] text-ink-400">/{p.unit}</span>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={p.unit}
                      onChange={(e) => quickSave(p, { unit: e.target.value })}
                      className="rounded-xl border border-ink-200 bg-white px-2.5 py-2 text-xs font-bold text-ink-700 outline-none focus:border-moss-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200"
                      aria-label={`Unit for ${p.name}`}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Toggle
                        on={p.available}
                        onChange={(v) => quickSave(p, { available: v })}
                      />
                      <span className="text-[11px] font-bold text-ink-400">
                        {p.available ? 'Live' : 'Paused'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-ink-400">{formatDate(p.updatedAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      {savingId === p._id ? (
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-moss-50 text-moss-600 dark:bg-ink-800">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(p)}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-ink-200 text-ink-500 transition hover:border-moss-400 hover:text-moss-700 dark:border-ink-700"
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => remove(p)}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-ink-200 text-ink-400 transition hover:border-red-400 hover:text-red-500 dark:border-ink-700"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 w-full rounded-3xl" />)}
        {!loading &&
          filtered.map((p) => (
            <div key={p._id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-extrabold text-ink-900 dark:text-white">{p.name}</p>
                  <p className="text-[11px] font-semibold text-ink-400">
                    {p.category} • {formatDate(p.updatedAt)}
                  </p>
                </div>
                <Toggle on={p.available} onChange={(v) => quickSave(p, { available: v })} />
              </div>

              <div className="mt-3 grid grid-cols-[1fr,auto] gap-2">
                <label className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-700 dark:bg-ink-950">
                  <span className="text-xs font-bold text-ink-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    defaultValue={p.price}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (Number.isFinite(v) && v !== p.price) quickSave(p, { price: v });
                    }}
                    className="w-full bg-transparent text-sm font-extrabold text-ink-900 outline-none dark:text-white"
                    aria-label={`Price for ${p.name}`}
                  />
                  <span className="text-[11px] text-ink-400">/ {p.unit}</span>
                </label>
                <select
                  value={p.unit}
                  onChange={(e) => quickSave(p, { unit: e.target.value })}
                  className="rounded-2xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 outline-none dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200"
                  aria-label={`Unit for ${p.name}`}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(p)} className="btn-ghost flex-1 py-2 text-xs">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => remove(p)}
                  className="btn flex-1 border border-red-200 py-2 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
              <p className="mt-2 text-right text-[11px] text-ink-400">
                Live price: <b className="text-moss-700 dark:text-moss-300">{inr(p.price)}</b>
              </p>
            </div>
          ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="card px-6 py-12 text-center text-sm text-ink-500">
          No products match this filter.
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setModal(null)} />
            <motion.form
              onSubmit={submitModal}
              initial={{ y: 60, opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white p-5 sm:rounded-[28px] dark:bg-ink-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
                  {modal.mode === 'create' ? 'Add product' : 'Edit product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Name *</label>
                  <input
                    className="input"
                    required
                    value={modal.form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Iron"
                  />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select
                    className="input"
                    value={modal.form.category}
                    onChange={(e) => setField('category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Unit *</label>
                  <select
                    className="input"
                    value={modal.form.unit}
                    onChange={(e) => setField('unit', e.target.value)}
                  >
                    {UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Price (₹ per unit) *</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={modal.form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="label">Available</label>
                  <div className="flex h-[46px] items-center gap-3">
                    <Toggle on={modal.form.available} onChange={(v) => setField('available', v)} />
                    <span className="text-xs font-bold text-ink-500">
                      {modal.form.available ? 'Shown on site' : 'Hidden from site'}
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={modal.form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Short line shown on the card"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Image URL</label>
                  <input
                    className="input"
                    value={modal.form.image}
                    onChange={(e) => setField('image', e.target.value)}
                    placeholder="https://…/iron.jpg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Or upload image (max 2 MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-moss-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-moss-700"
                    onChange={(e) => setField('imageFile', e.target.files?.[0] || null)}
                  />
                  {modal.form.imageFile && (
                    <p className="mt-1.5 text-xs font-semibold text-moss-700">
                      Selected: {modal.form.imageFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex gap-2.5">
                <button type="button" onClick={() => setModal(null)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="btn-primary flex-1 py-3.5">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modal.mode === 'create' ? 'Add product' : 'Save changes'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-xs font-bold text-white shadow-lift dark:bg-white dark:text-ink-950"
          >
            <Check className="h-4 w-4 text-moss-500" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
