import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ApiError, asyncHandler } from '../utils.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) throw new ApiError(400, 'Username and password are required.');

    const okUser = String(username) === process.env.ADMIN_USERNAME;
    const okPass = String(password) === process.env.ADMIN_PASSWORD;
    if (!okUser || !okPass) throw new ApiError(401, 'Invalid username or password.');

    const token = signToken({ sub: 'admin', username: process.env.ADMIN_USERNAME });
    const admin = { username: process.env.ADMIN_USERNAME };
    res.json({ success: true, token, admin, data: { token, admin } });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const admin = { username: process.env.ADMIN_USERNAME };
    res.json({ success: true, admin, data: { admin } });
  })
);

export default router;
