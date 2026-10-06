import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'local-test-secret';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
process.env.CORS_ORIGIN = 'http://localhost:5173,http://127.0.0.1:5173';
process.env.PORT = process.env.PORT || '4000';
process.env.NODE_ENV = 'development';

const mongod = await MongoMemoryServer.create({
  instance: { launchTimeout: 90000 },
});
process.env.MONGODB_URI = mongod.getUri('scrap-hub');

const { runSeed } = await import('./src/seed.js');
await runSeed({ disconnect: false });

await import('./src/index.js');

console.log(`
--------------------------------------------------
 Local dev server ready (in-memory MongoDB)
   API      : http://localhost:${process.env.PORT}/api
   Admin    : username "${process.env.ADMIN_USERNAME}" / password "${process.env.ADMIN_PASSWORD}"
   Seeded   : 19 products + settings (minOrderKg = 30)
   Data is lost when this process stops.
   For a persistent database use MONGODB_URI in .env
--------------------------------------------------`);
