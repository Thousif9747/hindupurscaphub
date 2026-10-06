import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from './AppContext';

const CalculatorContext = createContext(null);

const KG_UNITS = ['kg', 'kilogram', 'kgs'];
const G_UNITS = ['gram', 'g', 'grams'];

/** Converts a quantity to kg. Non-weight units (piece, litre...) return null. */
export function toKg(quantity, unit) {
  const u = String(unit || 'kg').toLowerCase().trim();
  const q = Number(quantity) || 0;
  if (KG_UNITS.includes(u)) return q;
  if (G_UNITS.includes(u)) return q / 1000;
  return null;
}

function load() {
  try {
    const raw = localStorage.getItem('hsh_calc');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CalculatorProvider({ children }) {
  const { minOrderKg } = useApp();
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('hsh_calc', JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addProduct = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: (Number(next[idx].qty) || 0) + Number(qty || 0) };
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          unit: product.unit || 'kg',
          price: Number(product.price) || 0,
          qty: Number(qty) || 0,
          category: product.category || 'Others',
        },
      ];
    });
  }, []);

  const setQty = useCallback((productId, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty: Math.max(0, Number(qty) || 0) } : i))
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    let weightKg = 0;
    let hasWeight = false;
    let nonWeightCount = 0;
    let amount = 0;

    for (const it of items) {
      const qty = Number(it.qty) || 0;
      const converted = toKg(qty, it.unit);
      if (converted !== null) {
        weightKg += converted;
        hasWeight = true;
      } else {
        nonWeightCount += 1;
      }
      amount += qty * (Number(it.price) || 0);
    }

    weightKg = Math.round(weightKg * 1000) / 1000;
    amount = Math.round(amount * 100) / 100;

    const min = Number(minOrderKg) || 30;
    const meetsMin = hasWeight && weightKg >= min;
    const remaining = meetsMin ? 0 : Math.round((min - weightKg) * 100) / 100;
    const progress = Math.max(0, Math.min(100, hasWeight ? (weightKg / min) * 100 : 0));

    return {
      weightKg,
      hasWeight,
      nonWeightCount,
      amount,
      min,
      meetsMin,
      remaining,
      progress,
      activeCount: items.filter((i) => (Number(i.qty) || 0) > 0).length,
    };
  }, [items, minOrderKg]);

  const value = useMemo(
    () => ({ items, addProduct, setQty, removeItem, clear, totals, open, setOpen }),
    [items, addProduct, setQty, removeItem, clear, totals, open]
  );

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('useCalculator must be used inside CalculatorProvider');
  return ctx;
}

export default CalculatorContext;
