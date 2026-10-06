import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, LockKeyhole, Scale, User } from 'lucide-react';
import api from '../../lib/api';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Enter username and password.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/auth/login', { username: username.trim(), password });
      login(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ink-950 px-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-moss-800/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-sun-700/20 blur-3xl" />
      <div className="hairline absolute inset-0 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-5 flex items-center justify-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-moss-600 to-moss-800 text-white shadow-glow">
            <Scale className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold text-white">
            Hindupur Scrap Hub
          </span>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <h1 className="font-display text-2xl font-extrabold text-white">Admin login</h1>
          <p className="mt-1 text-xs text-ink-400">Update prices, minimum order and view requests.</p>

          <div className="mt-5 space-y-3.5">
            <div>
              <label className="label text-ink-400">Username</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  className="input border-white/10 bg-white/5 pl-11 text-white placeholder:text-ink-500 focus:border-moss-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                />
              </div>
            </div>
            <div>
              <label className="label text-ink-400">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="password"
                  className="input border-white/10 bg-white/5 pl-11 text-white placeholder:text-ink-500 focus:border-moss-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-500/15 px-3 py-2.5 text-xs font-semibold text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary mt-5 w-full py-3.5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>

          <p className="mt-4 text-center text-[11px] text-ink-500">
            Credentials are set in the server <span className="font-bold text-ink-300">.env</span> as
            ADMIN_USERNAME / ADMIN_PASSWORD.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
