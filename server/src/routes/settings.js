import { Router } from 'express';
import Setting, { getSetting, setSetting } from '../models/Setting.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils.js';

const router = Router();

const DEFAULTS = {
  minOrderKg: Number(process.env.MIN_ORDER_KG) || 30,
  phone: '+91 90309 24528',
  whatsapp: '919030924528',
  address: 'Main Bazaar Road, Hindupur, Anantapur, Andhra Pradesh 515201',
  workingHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 9:00 AM - 2:00 PM',
  shopName: 'Hindupur Scrap Hub',
  tagline: 'We buy your scrap at the best price',
  mapQuery: 'Hindupur, Andhra Pradesh',
  email: 'hello@hindupurscraphub.in',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const keys = Object.keys(DEFAULTS);
    const docs = await Setting.find({ key: { $in: keys } }).lean();
    const stored = Object.fromEntries(docs.map((d) => [d.key, d.value]));
    const settings = { ...DEFAULTS, ...stored };
    res.json({ success: true, data: settings });
  })
);

router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const updates = {};
    for (const key of Object.keys(DEFAULTS)) {
      if (body[key] === undefined) continue;
      let value = body[key];
      if (key === 'minOrderKg') {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0 || n > 100000) {
          throw new ApiError(400, 'Minimum order must be a number between 1 and 100000.');
        }
        value = Math.round(n * 100) / 100;
      } else {
        value = String(value).slice(0, 500);
      }
      updates[key] = value;
    }
    if (!Object.keys(updates).length) throw new ApiError(400, 'No valid settings provided.');
    await Promise.all(Object.entries(updates).map(([k, v]) => setSetting(k, v)));
    const keys = Object.keys(DEFAULTS);
    const docs = await Setting.find({ key: { $in: keys } }).lean();
    const stored = Object.fromEntries(docs.map((d) => [d.key, d.value]));
    res.json({ success: true, data: { ...DEFAULTS, ...stored }, message: 'Settings saved.' });
  })
);

export default router;
export { DEFAULTS, getSetting };
