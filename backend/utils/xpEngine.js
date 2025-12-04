// backend/utils/xpEngine.js

/**
 * XP rules:
 * - critical: 500 XP
 * - high: 300 XP
 * - medium: 150 XP
 * - low: 50 XP
 *
 * Level formula (example): level = floor( sqrt(xp / 100) ) + 1
 * or custom progression: requiredXPForLevel(n) = 100 * n * n
 *
 * Tier mapping by level:
 * Bronze: 1-3
 * Silver: 4-6
 * Gold: 7-9
 * Platinum: 10-12
 * Diamond: 13+
 */

export const SEVERITY_XP = {
  critical: Number(process.env.XP_CRITICAL) || 500,
  high: Number(process.env.XP_HIGH) || 300,
  medium: Number(process.env.XP_MEDIUM) || 150,
  low: Number(process.env.XP_LOW) || 50,
};


export function xpForSeverity(severity) {
  return SEVERITY_XP[severity?.toLowerCase()] || 0;
}

// Required total XP for a given level (quadratic progression)
export function requiredXpForLevel(level) {
  // level 1 -> 100, level 2 -> 400, level 3 -> 900 ...
  return 100 * level * level;
}

// Compute level based on total xp (inverse of requiredXpForLevel)
export function levelFromXp(xp) {
  if (!xp || xp <= 0) return 1;
  // find largest level s.t. requiredXpForLevel(level) <= xp
  let level = Math.floor(Math.sqrt(xp / 100));
  if (level < 1) level = 1;
  return level;
}

// Tier from level
export function tierFromLevel(level) {
  if (level >= 13) return 'Diamond';
  if (level >= 10) return 'Platinum';
  if (level >= 7) return 'Gold';
  if (level >= 4) return 'Silver';
  return 'Bronze';
}

// progress percentage toward next level
export function levelProgress(xp) {
  const currentLevel = levelFromXp(xp);
  const currentLevelXp = requiredXpForLevel(currentLevel);
  const nextLevelXp = requiredXpForLevel(currentLevel + 1);
  const progress = Math.max(0, Math.min(1, (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)));
  return { currentLevel, progress, nextLevelXp, currentLevelXp };
}
