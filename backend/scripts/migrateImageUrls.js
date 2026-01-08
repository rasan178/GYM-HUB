/**
 * One-time migration: rewrite stored image URLs (localhost/dev) to production base URL.
 *
 * Usage:
 *   PUBLIC_BASE_URL=https://<your-render-service>.onrender.com MONGO_URI=... node scripts/migrateImageUrls.js
 * or:
 *   PUBLIC_BASE_URL=... MONGO_URI=... npm run migrate:image-urls
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Ensure models are registered
require('../models/Counter');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const ClassModel = require('../models/Class');
const Testimonial = require('../models/Testimonial');

const baseUrl = (process.env.PUBLIC_BASE_URL || process.env.BASE_URL || '').replace(/\/+$/, '');
if (!baseUrl) {
  console.error('❌ Missing PUBLIC_BASE_URL (or BASE_URL). Set it to your Render backend, e.g. https://<service>.onrender.com');
  process.exit(1);
}

const normalizeOne = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/images/')) return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // Relative uploads -> absolute
  if (url.startsWith('/uploads/')) return `${baseUrl}${url}`;
  if (url.startsWith('uploads/')) return `${baseUrl}/${url}`;

  // Replace localhost origins
  if (url.startsWith('http://localhost:5000/')) return `${baseUrl}${url.replace('http://localhost:5000', '')}`;
  if (url.startsWith('http://127.0.0.1:5000/')) return `${baseUrl}${url.replace('http://127.0.0.1:5000', '')}`;

  // Upgrade Render http -> https
  if (baseUrl.startsWith('https://') && url.startsWith('http://') && url.includes('onrender.com')) {
    return url.replace(/^http:\/\//, 'https://');
  }

  return url;
};

const normalizeMany = (arr) => (Array.isArray(arr) ? arr.map(normalizeOne) : arr);

async function migrateCollection(model, name, transformFn) {
  const cursor = model.find({}).cursor();
  const ops = [];
  let scanned = 0;
  let changed = 0;

  for await (const doc of cursor) {
    scanned++;
    const update = transformFn(doc);
    if (update) {
      changed++;
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: update },
        },
      });
    }

    if (ops.length >= 500) {
      await model.bulkWrite(ops, { ordered: false });
      ops.length = 0;
      process.stdout.write(`\r${name}: scanned=${scanned} changed=${changed}`);
    }
  }

  if (ops.length > 0) {
    await model.bulkWrite(ops, { ordered: false });
  }

  console.log(`\n✅ ${name} done. scanned=${scanned} changed=${changed}`);
}

async function main() {
  await connectDB();

  console.log(`Migrating image URLs to base: ${baseUrl}`);

  await migrateCollection(User, 'Users', (u) => {
    const next = normalizeOne(u.profileImageURL);
    if (next !== u.profileImageURL) return { profileImageURL: next };
    return null;
  });

  await migrateCollection(Trainer, 'Trainers', (t) => {
    const nextImage = normalizeOne(t.image);
    const nextImages = normalizeMany(t.images);
    const dirty = nextImage !== t.image || JSON.stringify(nextImages) !== JSON.stringify(t.images);
    if (!dirty) return null;
    return { image: nextImage, images: nextImages };
  });

  await migrateCollection(ClassModel, 'Classes', (c) => {
    const next = normalizeMany(c.imageURLs);
    if (JSON.stringify(next) !== JSON.stringify(c.imageURLs)) return { imageURLs: next };
    return null;
  });

  await migrateCollection(Testimonial, 'Testimonials', (t) => {
    const nextImageURL = normalizeOne(t.imageURL);
    const nextImageURLs = normalizeMany(t.imageURLs);
    const dirty =
      nextImageURL !== t.imageURL || JSON.stringify(nextImageURLs) !== JSON.stringify(t.imageURLs);
    if (!dirty) return null;
    return { imageURL: nextImageURL, imageURLs: nextImageURLs };
  });

  await mongoose.disconnect();
  console.log('✅ Migration complete.');
}

main().catch(async (err) => {
  console.error('❌ Migration failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});

