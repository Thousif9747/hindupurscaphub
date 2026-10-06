import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Enquiry from '../models/Enquiry.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler, requireFields, cleanPhone } from '../utils.js';

const router = Router();

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

router.post(
  '/',
  postLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    requireFields(body, ['name', 'phone']);
    const doc = await Enquiry.create({
      name: String(body.name).trim(),
      phone: cleanPhone(body.phone),
      scrapType: String(body.scrapType || '').trim(),
      quantity: String(body.quantity || '').trim(),
      message: String(body.message || '').trim(),
    });
    res.status(201).json({ success: true, data: doc, message: 'Thanks! We will call you back shortly.' });
  })
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const docs = await Enquiry.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, data: docs });
  })
);

router.put(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = req.body?.status;
    if (!['new', 'contacted', 'closed'].includes(status)) throw new ApiError(400, 'Invalid status.');
    const doc = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) throw new ApiError(404, 'Enquiry not found.');
    res.json({ success: true, data: doc });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const doc = await Enquiry.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Enquiry not found.');
    res.json({ success: true, message: 'Enquiry deleted.' });
  })
);

export default router;
