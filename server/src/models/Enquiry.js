import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
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
    scrapType: { type: String, trim: true, maxlength: 80, default: '' },
    quantity: { type: String, trim: true, maxlength: 60, default: '' },
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Enquiry', enquirySchema);
