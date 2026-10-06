import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    price: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const pickupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => /^[0-9+\-\s]{8,16}$/.test(v),
        message: 'Enter a valid phone number',
      },
    },
    address: { type: String, trim: true, maxlength: 300, default: '' },
    items: {
      type: [itemSchema],
      validate: [(v) => v.length > 0, 'At least one item is required'],
    },
    totalWeight: { type: Number, required: true, min: 0 },
    weightUnit: { type: String, default: 'kg' },
    estimatedTotal: { type: Number, required: true, min: 0 },
    minOrderKg: { type: Number, default: 30 },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: ['new', 'scheduled', 'done', 'cancelled'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Pickup', pickupSchema);
