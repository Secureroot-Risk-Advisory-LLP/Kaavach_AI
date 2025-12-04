// backend/seed/seedGamify.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User.model.js';
import Report from '../models/Report.model.js';
import { xpForSeverity, levelFromXp, tierFromLevel } from '../utils/xpEngine.js';

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/kaavach-ai';

await mongoose.connect(MONGO);

const users = await User.find({});
for (const u of users) {
  const reports = await Report.find({ submittedBy: u._id, status: 'accepted' });
  let xp = 0;
  reports.forEach(r => {
    const awarded = r.xpAwarded ?? xpForSeverity(r.severity);
    xp += awarded;
    if (!r.xpAwarded) {
      r.xpAwarded = awarded;
      r.save().catch(()=>{});
    }
  });
  u.xp = xp;
  u.level = levelFromXp(xp);
  u.tier = tierFromLevel(u.level);
  await u.save();
  console.log(`Seeded ${u.email}: xp=${xp} level=${u.level} tier=${u.tier}`);
}

console.log('Gamification seed complete');
process.exit(0);
