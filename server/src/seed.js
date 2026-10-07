import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Setting, { setSetting } from './models/Setting.js';

const PRODUCTS = [
  // Metals
  { name: 'Iron', category: 'Metals', price: 25, description: 'Iron scrap, rods, sheets, utensils and old grill.' },
  { name: 'Aluminium', category: 'Metals', price: 160, description: 'Aluminium vessels, frames, wires and sheets.' },
  { name: 'Copper', category: 'Metals', price: 1000, description: 'Pure copper wire, pipes and utensils.' },
  { name: 'RM Copper', category: 'Metals', price: 1100, description: 'Red metal scrap, best rate in town.' },
  { name: 'Pittal (Brass)', category: 'Metals', price: 600, description: 'Brass lamps, vessels and fittings.' },
  { name: 'Gun Metal', category: 'Metals', price: 500, description: 'Gun metal scrap and machine parts.' },
  { name: 'Silver', category: 'Metals', price: 180, description: 'Silver foil and light silver scrap.' },
  // Plastic
  { name: 'Plastic', category: 'Plastic', price: 12, description: 'Mixed hard and soft plastic waste.' },
  { name: 'PET Bottle', category: 'Plastic', price: 15, description: 'Clean PET water and soft drink bottles.' },
  // Paper
  { name: 'Books', category: 'Paper', price: 12, description: 'Old books, notebooks and magazines.' },
  { name: 'Cardboard', category: 'Paper', price: 10, description: 'Cartons, boxes and packing sheets.' },
  { name: 'Old Newspaper', category: 'Paper', price: 5, description: 'Bundle of old newspapers.' },
  { name: 'New Paper', category: 'Paper', price: 15, description: 'Fresh white office paper and charts.' },
  // Oil
  { name: 'Used/Waste Oil', category: 'Oil', price: 15, description: 'Used cooking oil and waste lubricant oil (per litre).' },
  // Agro
  { name: 'Tamarind (new and old)', category: 'Agro', price: 25, description: 'New and old tamarind waste.' },
  { name: 'Waste Coconut', category: 'Agro', price: 50, description: 'Dried coconut shells and waste.' },
  { name: 'Neem Seeds', category: 'Agro', price: 25, description: 'Dried neem seeds.' },
  { name: 'Corn', category: 'Agro', price: 10, description: 'Dry corn and corn waste.' },
  { name: 'Store Rice', category: 'Agro', price: 15, description: 'Aged and store rice scrap.' },
];

const DEFAULT_SETTINGS = {
  minOrderKg: Number(process.env.MIN_ORDER_KG) || 30,
  phone: '+91 90309 24528',
  whatsapp: '919030924528',
  address: 'Main Bazaar Road, Hindupur, Anantapur, Andhra Pradesh 515201',
  workingHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 9:00 AM - 2:00 PM',
  shopName: 'Hindupur Scrap Hub',
  tagline: 'We buy your scrap at the best price',
  mapQuery: 'Hindupur, Andhra Pradesh',
  email: 'hello@hindupurscarphub.in',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
};

export async function runSeed({ disconnect = true } = {}) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing. Set it in server/.env');
    process.exit(1);
  }

  if (mongoose.connection.readyState !== 1) await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  const wipe = process.argv.includes('--wipe');

  if (wipe) {
    await Promise.all([Product.deleteMany({}), Setting.deleteMany({})]);
    console.log('Wiped products & settings.');
  }

  let created = 0;
  let updated = 0;
  let index = 0;
  for (const p of PRODUCTS) {
    index += 1;
    const existing = await Product.findOne({ name: p.name, category: p.category });
    if (existing) {
      // Keep admin-edited prices on re-seed unless --wipe was used
      updated += 1;
    } else {
      await Product.create({ ...p, unit: 'kg', available: true, order: index });
      created += 1;
    }
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const doc = await Setting.findOne({ key });
    if (!doc) {
      await setSetting(key, value);
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`Seed complete. created=${created} unchanged=${updated} total=${await Product.countDocuments()}`);
  if (disconnect) await mongoose.disconnect();
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

export default runSeed;
