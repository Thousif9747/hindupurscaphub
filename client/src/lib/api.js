const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getToken() {
  try {
    return localStorage.getItem('hsh_admin_token') || '';
  } catch {
    return '';
  }
}

async function request(path, { method = 'GET', body, auth = false, raw = false } = {}) {
  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    const text = await res.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      'Unexpected response from the API. Check VITE_API_URL in client/.env (it must end with /api).'
    );
  }

  if (!res.ok) {
    const err = new Error(json?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return raw ? json : json?.data;
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
};

export default api;
