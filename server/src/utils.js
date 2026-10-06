export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value for: ' + Object.keys(err.keyValue || {}).join(', ');
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
}

/** Weight helpers ---------------------------------------------------------- */
const KG_UNITS = { kg: 1, kilogram: 1, kgs: 1 };
const G_UNITS = { gram: 1, g: 1, grams: 1 };

/**
 * Converts a quantity to kilograms for the minimum-order check.
 * Non weight units (piece, litre, dozen, bag...) return null -> excluded
 * from the minimum weight calculation (documented in README).
 */
export function toKg(quantity, unit) {
  const u = String(unit || 'kg').toLowerCase().trim();
  if (KG_UNITS[u]) return quantity;
  if (G_UNITS[u]) return quantity / 1000;
  return null;
}

export function totalWeightKg(items = []) {
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

/** Validation helpers ------------------------------------------------------ */
export function requireFields(obj, fields) {
  const missing = fields.filter((f) => {
    const v = obj?.[f];
    return v === undefined || v === null || (typeof v === 'string' && !v.trim());
  });
  if (missing.length) throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`);
}

export function cleanPhone(phone) {
  const p = String(phone || '').replace(/[^\d+]/g, '');
  if (p.replace(/\D/g, '').length < 8 || p.replace(/\D/g, '').length > 15) {
    throw new ApiError(400, 'Please enter a valid phone number (8-15 digits).');
  }
  return p;
}
