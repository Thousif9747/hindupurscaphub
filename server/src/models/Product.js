import mongoose from 'mongoose';

export const CATEGORIES = ['Metals', 'Plastic', 'Paper', 'Agro', 'Oil', 'Others'];
export const UNITS = ['kg', 'gram', 'piece', 'litre', 'dozen', 'bag'];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 80 },
    category: { type: String, required: true, enum: CATEGORIES, default: 'Others' },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: { type: String, enum: UNITS, default: 'kg' },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    image: { type: String, trim: true, default: '' },
    icon: { type: String, trim: true, default: '' },
    available: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', category: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
