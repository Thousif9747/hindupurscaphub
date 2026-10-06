import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Pickup from '../models/Pickup.js';
import Setting from '../models/Setting.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler, requireFields, cleanPhone, totalWeightKg, toKg } from '../utils.js';

const router = Router();

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many pickup requests. Please try again later.' },
});

async function resolveMinOrder() {
  const doc = await Setting.findOne({ key: 'minOrderKg' }).lean();
  const fallback = Number(process.env.MIN_ORDER_KG) || 30;
  const value = doc ? Number(doc.value) : fallback;
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

router.post(
  '/',
  postLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    requireFields(body, ['name', 'phone', 'items']);

    const items = Array.isArray(body.items) ? body.items : [];
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

    if (!cleanItems.length) throw new ApiError(400, 'Add at least one item with a quantity greater than 0.');

    const minOrderKg = await resolveMinOrder();
    const { kg, hasWeightUnit } = totalWeightKg(cleanItems);

    if (hasWeightUnit && kg < minOrderKg) {
      const short = Math.round((minOrderKg - kg) * 100) / 100;
      throw new ApiError(
        400,
        `Minimum order is ${minOrderKg} kg. Your order is ${kg} kg — add ${short} kg more to continue.`
      );
    }
    if (!hasWeightUnit) {
      throw new ApiError(
        400,
        `We need a weight-based order for pickup. Please include at least one item measured in kg or gram (minimum ${minOrderKg} kg).`
      );
    }

    const estimatedTotal =
      Math.round(cleanItems.reduce((sum, it) => sum + it.lineTotal, 0) * 100) / 100;

    const doc = await Pickup.create({
      name: String(body.name).trim(),
      phone: cleanPhone(body.phone),
      address: String(body.address || '').trim().slice(0, 300),
      items: cleanItems,
      totalWeight: kg,
      weightUnit: 'kg',
      estimatedTotal,
      minOrderKg,
      note: String(body.note || '').trim().slice(0, 500),
    });

    res.status(201).json({
      success: true,
      data: doc,
      message: `Pickup requested for ${kg} kg. We will call you shortly to confirm the time.`,
    });
  })
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const docs = await Pickup.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, data: docs });
  })
);

router.put(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = req.body?.status;
    if (!['new', 'scheduled', 'done', 'cancelled'].includes(status)) throw new ApiError(400, 'Invalid status.');
    const doc = await Pickup.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) throw new ApiError(404, 'Pickup request not found.');
    res.json({ success: true, data: doc });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const doc = await Pickup.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Pickup request not found.');
    res.json({ success: true, message: 'Pickup request deleted.' });
  })
);

export default router;
export { toKg };
