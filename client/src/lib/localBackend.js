/**
 * Local data layer.
 *
 * The site works without any API: every request the client makes is answered
 * from localStorage (seeded with the same 19 products + settings as server/seed.js).
 * If a real API is available and healthy, api.js prefers it and only falls back
 * here when the network fails, times out, or returns a non-JSON body.
 */

const KEY = 'hsh_local_store_v1';
const TOKEN_KEY = 'hsh_admin_token';

export const CATEGORIES = ['Metals', 'Plastic', 'Paper', 'Oil', 'Agro', 'Others'];
export const UNITS = ['kg', 'gram', 'piece', 'litre', 'dozen', 'bag'];

export const DEFAULT_SETTINGS = {
  minOrderKg: 30,
  phone: '+91 90309 24528',
  whatsapp: '919030924528',
  address: 'Main Bazaar Road, Hindupur, Anantapur, Andhra Pradesh 515201',
  workingHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 9:00 AM - 2:00 PM',
  shopName: 'Hindupur Scrap Hub',
  tagline: 'We buy your scrap at the best price',
  mapQuery: 'Hindupur, Andhra Pradesh',
  email: 'hello@hindupurscarphub.in',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
};

const PRODUCTS = [
  { name: 'Iron', category: 'Metals', price: 25, description: 'Iron scrap, rods, sheets, utensils and old grill.' },
  { name: 'Aluminium', category: 'Metals', price: 160, description: 'Aluminium vessels, frames, wires and sheets.' },
  { name: 'Copper', category: 'Metals', price: 1000, description: 'Pure copper wire, pipes and utensils.' },
  { name: 'RM Copper', category: 'Metals', price: 1100, description: 'Red metal scrap, best rate in town.' },
  { name: 'Pittal (Brass)', category: 'Metals', price: 600, description: 'Brass lamps, vessels and fittings.' },
  { name: 'Gun Metal', category: 'Metals', price: 500, description: 'Gun metal scrap and machine parts.' },
  { name: 'Silver', category: 'Metals', price: 180, description: 'Silver foil and light silver scrap.' },
  { name: 'Plastic', category: 'Plastic', price: 12, description: 'Mixed hard and soft plastic waste.' },
  { name: 'PET Bottle', category: 'Plastic', price: 15, description: 'Clean PET water and soft drink bottles.' },
  { name: 'Books', category: 'Paper', price: 12, description: 'Old books, notebooks and magazines.' },
  { name: 'Cardboard', category: 'Paper', price: 10, description: 'Cartons, boxes and packing sheets.' },
  { name: 'Old Newspaper', category: 'Paper', price: 5, description: 'Bundle of old newspapers.' },
  { name: 'New Paper', category: 'Paper', price: 15, description: 'Fresh white office paper and charts.' },
  { name: 'Used/Waste Oil', category: 'Oil', price: 15, description: 'Used cooking oil and waste lubricant oil (per litre).' },
  { name: 'Tamarind (new and old)', category: 'Agro', price: 25, description: 'New and old tamarind waste.' },
  { name: 'Waste Coconut', category: 'Agro', price: 50, description: 'Dried coconut shells and waste.' },
  { name: 'Neem Seeds', category: 'Agro', price: 25, description: 'Dried neem seeds.' },
  { name: 'Corn', category: 'Agro', price: 10, description: 'Dry corn and corn waste.' },
  { name: 'Store Rice', category: 'Agro', price: 15, description: 'Aged and store rice scrap.' },
];

const KG_UNITS = { kg: 1, kilogram: 1, kgs: 1 };
const G_UNITS = { gram: 1, g: 1, grams: 1 };

export class LocalError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.local = true;
  }
}

const now = () => new Date().toISOString();

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function seedProducts() {
  return PRODUCTS.map((p, i) => ({
    _id: uid('prod'),
    name: p.name,
    category: p.category,
    price: p.price,
    description: p.description,
    unit: 'kg',
    available: true,
    order: i + 1,
    createdAt: now(),
    updatedAt: now(),
  }));
}

function freshStore() {
  return {
    v: 1,
    settings: { ...DEFAULT_SETTINGS },
    products: seedProducts(),
    enquiries: [],
    pickups: [],
    creds: { username: 'admin', password: 'admin123' },
  };
}

function readStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.products)) return null;
    return { ...freshStore(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) } };
  } catch {
    return null;
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage full / disabled - keep working from memory */
  }
  return store;
}

function store() {
  const s = readStore();
  if (s) return s;
  return writeStore(freshStore());
}

function requireAuth() {
  let token = '';
  try {
    token = localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    token = '';
  }
  if (!token) throw new LocalError(401, 'Unauthorized.');
  return token;
}

function cleanPhone(phone) {
  const p = String(phone || '').replace(/[^\d+]/g, '');
  const digits = p.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    throw new LocalError(400, 'Please enter a valid phone number (8-15 digits).');
  }
  return p;
}

function requireFields(obj, fields) {
  const missing = fields.filter((f) => {
    const v = obj?.[f];
    return v === undefined || v === null || (typeof v === 'string' && !v.trim());
  });
  if (missing.length) throw new LocalError(400, `Missing required field(s): ${missing.join(', ')}`);
}

function toKg(quantity, unit) {
  const u = String(unit || 'kg').toLowerCase().trim();
  if (KG_UNITS[u]) return quantity;
  if (G_UNITS[u]) return quantity / 1000;
  return null;
}

function totalWeightKg(items = []) {
  let kg = 0;
  let hasWeightUnit = false;
  for (const it of items) {
    const converted = toKg(Number(it.quantity), it.unit);
    if (converted !== null) {
      kg += converted;
      hasWeightUnit = true;
    }
  }
  return { kg: Math.round(kg * 1000) / 1000, hasWeightUnit };
}

async function bodyToObject(body) {
  if (!body) return {};
  if (!(body instanceof FormData)) return body;
  const out = {};
  for (const [key, value] of body.entries()) {
    if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
      out[key] = await fileToDataUrl(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new LocalError(400, 'Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sortProducts(list) {
  return [...list].sort((a, b) => {
    if ((a.order || 0) !== (b.order || 0)) return (a.order || 0) - (b.order || 0);
    if (a.category !== b.category) return String(a.category).localeCompare(String(b.category));
    if (b.price !== a.price) return b.price - a.price;
    return String(a.name).localeCompare(String(b.name));
  });
}

function validateProduct(data, { partial = false } = {}) {
  const out = {};
  if (!partial || data.name !== undefined) {
    const name = String(data.name || '').trim();
    if (!name) throw new LocalError(400, 'Product name is required.');
    out.name = name;
  }
  if (!partial || data.category !== undefined) {
    if (!CATEGORIES.includes(data.category)) {
      throw new LocalError(400, `Category must be one of: ${CATEGORIES.join(', ')}`);
    }
    out.category = data.category;
  }
  if (!partial || data.price !== undefined) {
    const price = Number(data.price);
    if (!Number.isFinite(price) || price < 0) throw new LocalError(400, 'Price must be a positive number.');
    out.price = price;
  }
  if (data.unit !== undefined) {
    if (!UNITS.includes(data.unit)) throw new LocalError(400, `Unit must be one of: ${UNITS.join(', ')}`);
    out.unit = data.unit;
  }
  if (data.description !== undefined) out.description = String(data.description || '').slice(0, 400);
  if (data.image !== undefined) out.image = String(data.image).slice(0, 2000000);
  if (data.available !== undefined) out.available = data.available === true || data.available === 'true';
  if (data.order !== undefined) out.order = Number(data.order) || 0;
  return out;
}

async function route(path, { method = 'GET', body, auth = false } = {}) {
  const [pathname, qs = ''] = path.split('?');
  const query = new URLSearchParams(qs);
  const parts = pathname.split('/').filter(Boolean); // ['products', ':id'] etc.
  const [root, id, sub] = parts;
  const s = store();

  // ---- settings ----
  if (root === 'settings' && !id) {
    if (method === 'GET') return { ...s.settings };
    if (method === 'PUT') {
      requireAuth();
      const data = await bodyToObject(body);
      const updates = {};
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (data[key] === undefined) continue;
        let value = data[key];
        if (key === 'minOrderKg') {
          const n = Number(value);
          if (!Number.isFinite(n) || n <= 0 || n > 100000) {
            throw new LocalError(400, 'Minimum order must be a number between 1 and 100000.');
          }
          value = Math.round(n * 100) / 100;
        } else {
          value = String(value).slice(0, 500);
        }
        updates[key] = value;
      }
      if (!Object.keys(updates).length) throw new LocalError(400, 'No valid settings provided.');
      s.settings = { ...s.settings, ...updates };
      writeStore(s);
      return { ...s.settings, message: 'Settings saved.' };
    }
  }

  // ---- products ----
  if (root === 'products') {
    if (method === 'GET' && !id) {
      const all = query.get('all') === 'true';
      const category = query.get('category');
      const search = query.get('search');
      const limit = Number(query.get('limit')) || 0;
      let list = s.products.filter((p) => (all ? true : p.available !== false));
      if (category && CATEGORIES.includes(category)) list = list.filter((p) => p.category === category);
      if (search) {
        const rx = new RegExp(escapeRegExp(search), 'i');
        list = list.filter((p) => rx.test(p.name) || rx.test(p.description || '') || rx.test(p.category));
      }
      list = sortProducts(list);
      if (limit > 0) list = list.slice(0, limit);
      return list.map((p) => ({ ...p }));
    }
    if (method === 'GET' && id) {
      const found = s.products.find((p) => p._id === id);
      if (!found) throw new LocalError(404, 'Product not found.');
      return { ...found };
    }
    if (method === 'POST' && !id) {
      requireAuth();
      const data = validateProduct(await bodyToObject(body));
      const doc = {
        _id: uid('prod'),
        available: true,
        unit: 'kg',
        order: s.products.length + 1,
        ...data,
        createdAt: now(),
        updatedAt: now(),
      };
      s.products.push(doc);
      writeStore(s);
      return { ...doc };
    }
    if (method === 'PUT' && id) {
      requireAuth();
      const index = s.products.findIndex((p) => p._id === id);
      if (index === -1) throw new LocalError(404, 'Product not found.');
      const data = validateProduct(await bodyToObject(body), { partial: true });
      if (!Object.keys(data).length) throw new LocalError(400, 'Nothing to update.');
      s.products[index] = { ...s.products[index], ...data, updatedAt: now() };
      writeStore(s);
      return { ...s.products[index] };
    }
    if (method === 'DELETE' && id) {
      requireAuth();
      const index = s.products.findIndex((p) => p._id === id);
      if (index === -1) throw new LocalError(404, 'Product not found.');
      s.products.splice(index, 1);
      writeStore(s);
      return { message: 'Product deleted.' };
    }
  }

  // ---- pickups ----
  if (root === 'pickups') {
    if (method === 'GET' && !id) {
      requireAuth();
      return [...s.pickups].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    if (method === 'POST' && !id) {
      const data = await bodyToObject(body);
      requireFields(data, ['name', 'phone', 'items']);
      const items = Array.isArray(data.items) ? data.items : [];
      const cleanItems = items
        .map((it) => ({
          productId: String(it.productId || ''),
          name: String(it.name || '').trim().slice(0, 80),
          quantity: Number(it.quantity),
          unit: String(it.unit || 'kg').trim(),
          price: Number(it.price),
          lineTotal: Math.round((Number(it.quantity) || 0) * (Number(it.price) || 0) * 100) / 100,
        }))
        .filter((it) => it.name && it.quantity > 0);

      if (!cleanItems.length) {
        throw new LocalError(400, 'Add at least one item with a quantity greater than 0.');
      }

      const minOrderKg = Number(s.settings.minOrderKg) || 30;
      const { kg, hasWeightUnit } = totalWeightKg(cleanItems);

      if (hasWeightUnit && kg < minOrderKg) {
        const short = Math.round((minOrderKg - kg) * 100) / 100;
        throw new LocalError(
          400,
          `Minimum order is ${minOrderKg} kg. Your order is ${kg} kg - add ${short} kg more to continue.`
        );
      }
      if (!hasWeightUnit) {
        throw new LocalError(
          400,
          `We need a weight-based order for pickup. Please include at least one item measured in kg or gram (minimum ${minOrderKg} kg).`
        );
      }

      const estimatedTotal = Math.round(cleanItems.reduce((sum, it) => sum + it.lineTotal, 0) * 100) / 100;
      const doc = {
        _id: uid('pk'),
        name: String(data.name).trim(),
        phone: cleanPhone(data.phone),
        address: String(data.address || '').trim().slice(0, 300),
        items: cleanItems,
        totalWeight: kg,
        weightUnit: 'kg',
        estimatedTotal,
        minOrderKg,
        note: String(data.note || '').trim().slice(0, 500),
        status: 'new',
        createdAt: now(),
      };
      s.pickups.unshift(doc);
      writeStore(s);
      return { ...doc, message: `Pickup requested for ${kg} kg. We will call you shortly to confirm the time.` };
    }
    if (method === 'PUT' && id && sub === 'status') {
      requireAuth();
      const status = (await bodyToObject(body))?.status;
      if (!['new', 'scheduled', 'done', 'cancelled'].includes(status)) {
        throw new LocalError(400, 'Invalid status.');
      }
      const doc = s.pickups.find((p) => p._id === id);
      if (!doc) throw new LocalError(404, 'Pickup request not found.');
      doc.status = status;
      writeStore(s);
      return { ...doc };
    }
    if (method === 'DELETE' && id) {
      requireAuth();
      const index = s.pickups.findIndex((p) => p._id === id);
      if (index === -1) throw new LocalError(404, 'Pickup request not found.');
      s.pickups.splice(index, 1);
      writeStore(s);
      return { message: 'Pickup request deleted.' };
    }
  }

  // ---- enquiries ----
  if (root === 'enquiries') {
    if (method === 'GET' && !id) {
      requireAuth();
      return [...s.enquiries].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    if (method === 'POST' && !id) {
      const data = await bodyToObject(body);
      requireFields(data, ['name', 'phone']);
      const doc = {
        _id: uid('enq'),
        name: String(data.name).trim(),
        phone: cleanPhone(data.phone),
        scrapType: String(data.scrapType || '').trim(),
        quantity: String(data.quantity || '').trim(),
        message: String(data.message || '').trim(),
        status: 'new',
        createdAt: now(),
      };
      s.enquiries.unshift(doc);
      writeStore(s);
      return { ...doc, message: 'Thanks! We will call you back shortly.' };
    }
    if (method === 'PUT' && id && sub === 'status') {
      requireAuth();
      const status = (await bodyToObject(body))?.status;
      if (!['new', 'contacted', 'closed'].includes(status)) throw new LocalError(400, 'Invalid status.');
      const doc = s.enquiries.find((e) => e._id === id);
      if (!doc) throw new LocalError(404, 'Enquiry not found.');
      doc.status = status;
      writeStore(s);
      return { ...doc };
    }
    if (method === 'DELETE' && id) {
      requireAuth();
      const index = s.enquiries.findIndex((e) => e._id === id);
      if (index === -1) throw new LocalError(404, 'Enquiry not found.');
      s.enquiries.splice(index, 1);
      writeStore(s);
      return { message: 'Enquiry deleted.' };
    }
  }

  // ---- auth ----
  if (root === 'auth') {
    if (method === 'POST' && id === 'login') {
      const data = await bodyToObject(body);
      requireFields(data, ['username', 'password']);
      const creds = s.creds || { username: 'admin', password: 'admin123' };
      const okUser = String(data.username) === creds.username;
      const okPass = String(data.password) === creds.password;
      if (!okUser || !okPass) throw new LocalError(401, 'Invalid username or password.');
      const token = `local.${uid('tok')}`;
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {
        /* ignore */
      }
      return { token, admin: { username: creds.username } };
    }
    if (method === 'GET' && id === 'me') {
      requireAuth();
      const creds = s.creds || { username: 'admin' };
      return { admin: { username: creds.username } };
    }
  }

  throw new LocalError(404, 'Route not found');
}

export async function localRequest(path, opts = {}) {
  return route(path, opts);
}

export default localRequest;
