import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  Send,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';
import MinOrderBanner from '../components/MinOrderBanner';
import api from '../lib/api';
import { useApp } from '../context/AppContext';
import { digits, telLink, waLink } from '../lib/format';

const initialForm = { name: '', phone: '', scrapType: '', quantity: '', message: '' };

export default function Contact() {
  const { settings, minOrderKg, t } = useApp();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    if (form.name.trim().length < 2 || !/^[0-9+\-\s]{8,16}$/.test(form.phone.trim())) {
      setStatus({ type: 'error', msg: 'Please enter your name and a valid phone number.' });
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/enquiries', form);
      setStatus({ type: 'success', msg: res?.message || 'Thanks! We will call you back shortly.' });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setBusy(false);
    }
  };

  const mapQuery = encodeURIComponent(settings.mapQuery || 'Hindupur, Andhra Pradesh');

  return (
    <>
      <Seo
        title="Contact Hindupur Scrap Hub | Call +91 90309 24528 - Scrap Pickup"
        description={`Contact Hindupur Scrap Hub for scrap pickup, prices and enquiries. Phone +91 90309 24528, Hindupur, Andhra Pradesh. Minimum order ${minOrderKg} kg.`}
        keywords="scrap buyer contact Hindupur, scrap pickup Hindupur, sell scrap Hindupur phone"
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_75%_-20%,#D5F5E2_0%,transparent_60%),radial-gradient(600px_300px_at_0%_10%,#FFEECB_0%,transparent_55%)] dark:bg-[radial-gradient(900px_400px_at_75%_-20%,rgba(12,89,55,0.4)_0%,transparent_60%)]" />
        <div className="container-x py-10 sm:py-14">
          <Reveal className="max-w-2xl">
            <span className="chip bg-moss-50 text-moss-700 ring-1 ring-moss-200 dark:bg-ink-900 dark:text-moss-300 dark:ring-ink-700">
              <Phone className="h-3.5 w-3.5" /> We reply fast
            </span>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-950 sm:text-5xl dark:text-white">
              Contact us
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              Call, WhatsApp or fill the form — tell us what scrap you have and we will confirm the
              rate and pickup time.
            </p>
            <MinOrderBanner className="mt-5 max-w-xl" />
          </Reveal>
        </div>
      </section>

      <section className="container-x grid gap-6 pb-12 lg:grid-cols-[1fr,1.15fr]">
        {/* Contact details */}
        <div className="space-y-4">
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={telLink(settings.phone)}
                className="group card flex items-center gap-3 p-4 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-moss-600 text-white">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wide text-ink-400">
                    {t('callUs')} (tap to call)
                  </span>
                  <span className="block text-base font-extrabold text-ink-900 dark:text-white">
                    {settings.phone}
                  </span>
                </span>
              </a>

              <a
                href={waLink(settings.whatsapp, 'Hello Hindupur Scrap Hub! I want to sell scrap.')}
                target="_blank"
                rel="noreferrer"
                className="group card flex items-center gap-3 p-4 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#25D366] text-white">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wide text-ink-400">
                    WhatsApp us
                  </span>
                  <span className="block text-base font-extrabold text-ink-900 dark:text-white">
                    Chat now
                  </span>
                </span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="group card flex items-start gap-3 p-4 transition hover:-translate-y-1 hover:shadow-lift sm:col-span-2"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sun-500 text-ink-950">
                  <MapPin className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wide text-ink-400">
                    {t('address')}
                  </span>
                  <span className="block text-sm font-bold text-ink-900 dark:text-white">
                    {settings.address}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-moss-700 dark:text-moss-300">
                    <Navigation className="h-3.5 w-3.5" /> {t('getDirections')}
                  </span>
                </span>
              </a>

              <div className="card flex items-start gap-3 p-4 sm:col-span-2">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white dark:bg-white dark:text-ink-950">
                  <Clock className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wide text-ink-400">
                    {t('workingHours')}
                  </span>
                  <span className="block text-sm font-bold text-ink-900 dark:text-white">
                    {settings.workingHours}
                  </span>
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
                  Find us in Hindupur
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-moss-700 hover:underline dark:text-moss-300"
                >
                  Open in Maps
                </a>
              </div>
              <iframe
                title="Hindupur map"
                src={`https://maps.google.com/maps?q=${mapQuery}&z=13&output=embed`}
                className="h-64 w-full border-0 grayscale-[0.2] transition hover:grayscale-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-3xl border border-sun-200 bg-sun-50 p-4 dark:border-sun-700/50 dark:bg-sun-900/25">
              <p className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-sun-800 dark:text-sun-200">
                <Scale className="mt-0.5 h-4 w-4 shrink-0" />
                Minimum order: {minOrderKg} kg. Final price depends on actual weight and quality of
                the scrap. Rates change with market conditions.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Enquiry form */}
        <Reveal delay={0.06}>
          <form onSubmit={submit} className="card p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss-100 text-moss-700 dark:bg-ink-800 dark:text-moss-300">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-ink-900 dark:text-white">
                  Send an enquiry
                </h2>
                <p className="text-xs text-ink-500">We call back within working hours.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">{t('yourName')} *</label>
                <input className="input" value={form.name} onChange={set('name')} placeholder="Your full name" required />
              </div>
              <div>
                <label className="label">{t('phoneNumber')} *</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={set('phone')}
                  inputMode="tel"
                  placeholder="90309 24528"
                  required
                />
              </div>
              <div>
                <label className="label">{t('scrapType')}</label>
                <input
                  className="input"
                  value={form.scrapType}
                  onChange={set('scrapType')}
                  placeholder="e.g. Iron, cardboard"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t('approxQuantity')}</label>
                <input
                  className="input"
                  value={form.quantity}
                  onChange={set('quantity')}
                  placeholder={`e.g. 40 kg (min ${minOrderKg} kg)`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t('message')}</label>
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Address, landmark or anything we should know"
                />
              </div>
            </div>

            {status.msg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-semibold ${
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
              </motion.div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" disabled={busy} className="btn-primary flex-1 py-3.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t('sendEnquiry')}
              </button>
              <a
                href={waLink(settings.whatsapp, 'Hello! I have an enquiry about selling scrap.')}
                target="_blank"
                rel="noreferrer"
                className="btn bg-[#25D366] py-3.5 text-white hover:bg-[#1EBE5B]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <p className="mt-4 text-[11px] text-ink-400">
              By submitting you agree to be contacted on the phone number you share. Enquiry number:{' '}
              {digits(settings.phone)}
            </p>
          </form>
        </Reveal>
      </section>
    </>
  );
}
