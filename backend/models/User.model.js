import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  /* -----------------------------
        BASIC PROFILE
  ------------------------------*/
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['hacker', 'company', 'admin'], required: true },

  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },

  /* -----------------------------
        HACKER METRICS
  ------------------------------*/
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },

  /* ⭐ Badges upgraded */
  badges: [
    {
      name: String,
      icon: String,
      earnedAt: Date
    }
  ],

  /* -----------------------------
        PHASE 3.7 — GAMIFICATION
  ------------------------------*/
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  tier: { type: String, default: 'Bronze' },        // Bronze → Diamond
  streak: { type: Number, default: 0 },
  lastActive: { type: Date },

  /* Calculated metric for Leaderboards */
  impactScore: { type: Number, default: 0 },

  /* -----------------------------
        COMPANY METADATA
  ------------------------------*/
  companyName: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },

  /* -----------------------------
        AUTH HELPERS
  ------------------------------*/
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date

}, { timestamps: true });

/* ====================================================
    ⭐ LEVEL CALCULATION (SYNC WITH XP ENGINE)
   ====================================================*/

function requiredXpForLevel(level) {
  return 100 * level * level; // quadratic progression
}

function levelFromXp(xp) {
  if (!xp || xp <= 0) return 1;
  let level = Math.floor(Math.sqrt(xp / 100));
  return level < 1 ? 1 : level;
}

function tierFromLevel(level) {
  if (level >= 13) return 'Diamond';
  if (level >= 10) return 'Platinum';
  if (level >= 7) return 'Gold';
  if (level >= 4) return 'Silver';
  return 'Bronze';
}

/* ====================================================
    ⭐ PRE-SAVE HOOK — AUTO UPDATE LEVEL & TIER
   ====================================================*/
userSchema.pre('save', async function (next) {
  // Only hash password if changed
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // If XP changed → recalc level+tier automatically
  if (this.isModified('xp')) {
    const newLevel = levelFromXp(this.xp);
    this.level = newLevel;
    this.tier = tierFromLevel(newLevel);
  }

  next();
});

/* ====================================================
    ⭐ PASSWORD CHECK
   ====================================================*/
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
