// backend/controllers/gamification.controller.js
import User from '../models/User.model.js';
import Report from '../models/Report.model.js';
import { xpForSeverity, levelFromXp, tierFromLevel } from '../utils/xpEngine.js';
import mongoose from 'mongoose';

// award XP for a given report (should be called when report status becomes 'accepted')
export async function awardXpForReport(reportId) {
  if (!reportId) return null;
  const report = await Report.findById(reportId).populate('submittedBy');
  if (!report) throw new Error('Report not found');
  if (report.status !== 'accepted') return null;

  const severity = report.severity || 'low';
  const xp = xpForSeverity(severity);

  const userId = report.submittedBy._id;
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // add xp
  user.xp = (user.xp || 0) + xp;

  // update level/tier
  const newLevel = levelFromXp(user.xp);
  user.level = newLevel;
  user.tier = tierFromLevel(newLevel);

  // streak update: if lastActive was within 48h, increment; else reset to 1
  const now = new Date();
  if (user.lastActive) {
    const diffMs = now - new Date(user.lastActive);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    user.streak = diffDays <= 2 ? (user.streak || 0) + 1 : 1;
  } else {
    user.streak = 1;
  }
  user.lastActive = now;

  // optionally push badges
  user.badges = user.badges || [];
  if (xp >= 500 && !user.badges.includes('Critical Finder')) user.badges.push('Critical Finder');
  // add more badge rules if needed
  await user.save();

  // optionally store xp awarded on report for audit
  report.xpAwarded = xp;
  await report.save();

  return { userId: user._id, xpAwarded: xp, newLevel: user.level, tier: user.tier };
}

export async function recalcUserGamification(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // compute xp from accepted reports (safe if you want canonical source)
  const agg = await Report.aggregate([
    { $match: { submittedBy: user._id, status: 'accepted' } },
    { $group: { _id: null, totalXP: { $sum: '$xpAwarded' }, totalBySeverity: { $push: '$severity' } } }
  ]);
  const totalXP = (agg[0] && agg[0].totalXP) || 0;

  user.xp = totalXP;
  user.level = levelFromXp(user.xp);
  user.tier = tierFromLevel(user.level);
  await user.save();
  return user;
}
