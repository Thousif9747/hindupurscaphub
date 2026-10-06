import { Router } from 'express';
import multer from 'multer';
import Product, { CATEGORIES, UNITS } from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

function validateBody(body, { partial = false } = {}) {
  const data = {};
  if (!partial || body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) throw new ApiError(400, 'Product name is required.');
    data.name = name;
  }
  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) throw new ApiError(400, `Category must be one of: ${CATEGORIES.join(', ')}`);
    data.category = body.category;
  }
  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) throw new ApiError(400, 'Price must be a positive number.');
    data.price = price;
  }
  if (body.unit !== undefined) {
    if (!UNITS.includes(body.unit)) throw new ApiError(400, `Unit must be one of: ${UNITS.join(', ')}`);
    data.unit = body.unit;
  }
  if (body.description !== undefined) data.description = String(body.description || '').slice(0, 400);
  if (body.image !== undefined) data.image = String(body.image || '').slice(0, 2000000);
  if (body.available !== undefined) data.available = body.available === true || body.available === 'true';
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  return data;
}

// GET /api/products?category=&search=&limit=&all=true
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search, limit, all } = req.query;
    const q = {};
    if (all !== 'true') q.available = true;
    if (category && CATEGORIES.includes(category)) q.category = category;
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [{ name: rx }, { description: rx }, { category: rx }];
    }
    const docs = await Product.find(q)
      .sort({ order: 1, category: 1, price: -1, name: 1 })
      .limit(Math.min(Number(limit) || 0, 200) || 0)
      .lean();
    res.json({ success: true, data: docs, categories: CATEGORIES, units: UNITS });
  })
);

router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: CATEGORIES, units: UNITS });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Product.findById(req.params.id).lean();
    if (!doc) throw new ApiError(404, 'Product not found.');
    res.json({ success: true, data: doc });
  })
);

router.use(requireAuth);

router.post(
  '/',
  upload.single('imageFile'),
  asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (req.file) {
      body.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const data = validateBody(body);
    const doc = await Product.create(data);
    res.status(201).json({ success: true, data: doc });
  })
);

router.put(
  '/:id',
  upload.single('imageFile'),
  asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (req.file) {
      body.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const data = validateBody(body, { partial: true });
    if (!Object.keys(data).length) throw new ApiError(400, 'Nothing to update.');
    const doc = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(404, 'Product not found.');
    res.json({ success: true, data: doc });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Product not found.');
    res.json({ success: true, message: 'Product deleted.' });
  })
);

export default router;
