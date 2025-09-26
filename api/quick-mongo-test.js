import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

console.log('URI=', (process.env.MONGODB_URI||'').replace(/:\/\/.*@/,'://<redacted>@'));

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected with Mongoose');
  await mongoose.disconnect();
  process.exit(0);
} catch (e) {
  console.error('❌ Mongoose connect failed:', e?.message);
  process.exit(1);
}
