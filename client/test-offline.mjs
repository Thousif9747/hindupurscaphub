// Offline-mode smoke test for the local data layer + API fallback.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const tmp = path.join(process.cwd(), '_tmp_test');
mkdirSync(tmp, { recursive: true });

// localStorage shim for Node
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
globalThis.fetch = async () => {
  throw new Error('network down');
};

// copy the two client modules with import.meta.env rewritten for Node
for (const f of ['localBackend.js', 'api.js']) {
  const src = readFileSync(path.join(process.cwd(), 'src', 'lib', f), 'utf8')
    .replace(/import\.meta\.env\.(\w+)/g, '(process.env.$1)')
    .replace(/from '\.\/localBackend'/g, "from './localBackend.js'");
  writeFileSync(path.join(tmp, f), src);
}

const { localRequest } = await import(pathToFileURL(path.join(tmp, 'localBackend.js')).href);
const { default: api, getMode } = await import(pathToFileURL(path.join(tmp, 'api.js')).href);

let pass = 0;
let fail = 0;
const ok = (cond, label) => {
  if (cond) { pass += 1; console.log('  PASS', label); }
  else { fail += 1; console.log('  FAIL', label); }
};
const expectError = async (fn, includes, label) => {
  try {
    await fn();
    ok(false, label + ' (no error thrown)');
  } catch (e) {
    ok(String(e.message).includes(includes), `${label} -> "${e.message}"`);
  }
};

console.log('\n1. Products (offline)');
const all = await localRequest('/products?all=true&limit=500');
ok(all.length === 19, `19 products seeded (got ${all.length})`);
const metals = await localRequest('/products?category=Metals&limit=200');
ok(metals.length === 7, `Metals filter = 7 (got ${metals.length})`);
const search = await localRequest('/products?search=copper');
ok(search.length === 2, `search "copper" = 2 (got ${search.length})`);
const home = await localRequest('/products?limit=8');
ok(home.length === 8, 'home limit=8');

console.log('\n2. Settings + min order');
const s = await localRequest('/settings');
ok(Number(s.minOrderKg) === 30, 'minOrderKg = 30');
await expectError(
  () => localRequest('/pickups', { method: 'POST', body: { name: 'Ravi', phone: '9876543210', items: [{ name: 'Iron', quantity: 10, unit: 'kg', price: 25 }] } }),
  'Minimum order is 30 kg',
  '10 kg pickup rejected'
);
await expectError(
  () => localRequest('/pickups', { method: 'POST', body: { name: 'Ravi', phone: '9876543210', items: [{ name: 'Iron', quantity: 40, unit: 'gram', price: 25 }] } }),
  'Minimum order is 30 kg',
  '40 gram rejected'
);
await expectError(
  () => localRequest('/pickups', { method: 'POST', body: { name: 'Ravi', phone: '9876543210', items: [{ name: 'Iron', quantity: 5, unit: 'piece', price: 25 }] } }),
  'weight-based order',
  'piece-only rejected'
);
const good = await localRequest('/pickups', { method: 'POST', body: { name: 'Ravi', phone: '9876543210', address: 'Door 1', items: [{ name: 'Iron', quantity: 40, unit: 'kg', price: 25 }] } });
ok(good.totalWeight === 40 && good.estimatedTotal === 1000, `40 kg pickup accepted (weight=${good.totalWeight}, total=${good.estimatedTotal})`);

console.log('\n3. Enquiry + admin');
const enq = await localRequest('/enquiries', { method: 'POST', body: { name: 'Sita', phone: '9876543210', scrapType: 'Iron', quantity: '50', message: 'call me' } });
ok(enq.status === 'new', 'enquiry created');
await expectError(() => localRequest('/auth/login', { method: 'POST', body: { username: 'admin', password: 'wrong' } }), 'Invalid username', 'bad password rejected');
const login = await localRequest('/auth/login', { method: 'POST', body: { username: 'admin', password: 'admin123' } });
ok(Boolean(login.token), 'local admin login works');
const pickupsList = await localRequest('/pickups', { auth: true });
ok(pickupsList.length === 1, `admin sees pickup (${pickupsList.length})`);
const updated = await localRequest('/settings', { method: 'PUT', body: { minOrderKg: 45 }, auth: true });
ok(updated.minOrderKg === 45 && updated.message, 'admin can change min order');
const after = await localRequest('/settings');
ok(after.minOrderKg === 45, 'new min order persisted');
await localRequest('/settings', { method: 'PUT', body: { minOrderKg: 30 }, auth: true });
const p = await localRequest('/products', { method: 'POST', body: { name: 'Test Item', category: 'Others', price: 99, unit: 'kg', available: 'true' }, auth: true });
ok(Boolean(p._id), 'admin can create product');
const patched = await localRequest(`/products/${p._id}`, { method: 'PUT', body: { price: 120 }, auth: true });
ok(patched.price === 120, 'admin can edit price');
await localRequest(`/products/${p._id}`, { method: 'DELETE', auth: true });
const gone = await localRequest('/products?all=true&limit=500');
ok(gone.length === 19, 'admin can delete product');

console.log('\n4. api.js falls back to local when the network is down');
const viaApi = await api.get('/products?limit=8');
ok(Array.isArray(viaApi) && viaApi.length === 8, `api.get returns local products (${viaApi?.length})`);
ok(getMode() === 'local', `mode switched to "${getMode()}"`);
await expectError(() => api.post('/pickups', { name: 'X', phone: '9876543210', items: [{ name: 'Iron', quantity: 5, unit: 'kg', price: 25 }] }), 'Minimum order is 30 kg', 'min order enforced through api.js');

console.log(`\n${fail === 0 ? 'ALL PASSED' : 'FAILURES'} -> ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
