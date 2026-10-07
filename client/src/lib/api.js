import { localRequest, LocalError } from './localBackend';

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
// VITE_API_URL=local (or VITE_OFFLINE=1) skips the network entirely.
const FORCE_LOCAL = import.meta.env.VITE_API_URL === 'local' || import.meta.env.VITE_OFFLINE === '1';
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT) || 12000;

/** 'live' while the API answers, 'local' once we have fallen back to localStorage. */
let mode = FORCE_LOCAL ? 'local' : 'unknown';
const listeners = new Set();

export function getMode() {
  return mode;
}

export function subscribeMode(fn) {
  listeners.add(fn);
  fn(mode);
  return () => listeners.delete(fn);
}

function setMode(next) {
  if (mode === next) return;
  mode = next;
  listeners.forEach((fn) => {
    try {
      fn(next);
    } catch {
      /* ignore listener errors */
    }
  });
}

function getToken() {
  try {
    return localStorage.getItem('hsh_admin_token') || '';
  } catch {
    return '';
  }
}

function fallbackError(reason) {
  const err = new Error(reason);
  err.fallback = true;
  return err;
}

async function networkRequest(path, { method = 'GET', body, auth = false, raw = false, timeout } = {}) {
  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout || TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    throw fallbackError(e?.name === 'AbortError' ? 'API timed out.' : 'API is unreachable.');
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text().catch(() => '');
  let json = null;
  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      // HTML (SPA fallback), empty or garbage body -> the API is not there
      throw fallbackError('API returned a non-JSON response.');
    }
  } else {
    throw fallbackError('API returned an empty response.');
  }

  if (res.status >= 500) {
    const err = new Error(json?.message || 'Server error.');
    err.status = res.status;
    err.fallback = true;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(json?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return raw ? json : json?.data;
}

async function request(path, opts = {}) {
  if (FORCE_LOCAL) return localRequest(path, opts);

  try {
    const out = await networkRequest(path, opts);
    setMode('live');
    return out;
  } catch (err) {
    if (!err?.fallback && !(err?.status >= 500)) throw err;
    try {
      const data = await localRequest(path, opts);
      setMode('local');
      return data;
    } catch (localErr) {
      if (localErr instanceof LocalError) throw localErr;
      throw err;
    }
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  del: (path, opts) => request(path, { method: 'DELETE', ...opts }),
  authed: {
    get: (path) => request(path, { auth: true }),
    post: (path, body) => request(path, { method: 'POST', body, auth: true }),
    put: (path, body) => request(path, { method: 'PUT', body, auth: true }),
    del: (path) => request(path, { method: 'DELETE', auth: true }),
  },
  getMode,
  subscribeMode,
};

export default api;
