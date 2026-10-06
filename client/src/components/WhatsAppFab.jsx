import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCalculator } from '../context/CalculatorContext';
import { waLink } from '../lib/format';

export default function WhatsAppFab() {
  const { settings, t } = useApp();
  const { totals, items } = useCalculator();
  const phone = settings.whatsapp || '919030924528';

  const base = `Hello Hindupur Scrap Hub! I want to sell my scrap.`;
  const calcLine = totals.activeCount
    ? ` Currently: ${items
        .filter((i) => (Number(i.qty) || 0) > 0)
        .map((i) => `${i.name} ${i.qty} ${i.unit}`)
        .join(', ')} (≈ ${totals.weightKg} kg, approx ${Math.round(totals.amount)} INR).`
    : '';
  const link = waLink(phone, base + calcLine);

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label={t('whatsappUs')}
      className="group fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-110 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <span className="absolute inset-0 -z-10 animate-pulseRing rounded-full bg-[#25D366]" />
      <MessageCircle className="h-7 w-7" strokeWidth={2.2} />
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-soft transition-opacity group-hover:opacity-100 dark:bg-white dark:text-ink-950 sm:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
