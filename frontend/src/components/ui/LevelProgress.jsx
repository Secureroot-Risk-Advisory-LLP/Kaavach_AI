// src/components/ui/LevelProgress.jsx
import React from "react";

/**
 * Matches backend xpEngine.js:
 * requiredXPForLevel(level) = 100 * level * level
 * Example:
 *  L1 → 100
 *  L2 → 400
 *  L3 → 900
 *  Progress = (xp - base) / (next - base)
 */

const requiredXpForLevel = (lvl) => 100 * lvl * lvl;

const LevelProgress = ({ xp = 0, level = 1, tier = "Bronze" }) => {
  // backend-aligned values
  const baseXp = requiredXpForLevel(level);
  const nextXp = requiredXpForLevel(level + 1);

  const progressRaw = (xp - baseXp) / (nextXp - baseXp);
  const pct = Math.max(0, Math.min(100, Math.round(progressRaw * 100)));

  const tierColors = {
    Bronze: "from-amber-500 to-yellow-400",
    Silver: "from-slate-300 to-slate-100",
    Gold: "from-yellow-400 to-amber-300",
    Platinum: "from-blue-300 to-cyan-200",
    Diamond: "from-cyan-400 to-emerald-300",
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm font-semibold">Level {level}</p>
          <p className="text-xs text-muted-foreground">
            {xp} XP • Tier: {tier}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 bg-gradient-to-r ${tierColors[tier] || tierColors.Bronze}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Footer */}
      <p className="text-[11px] mt-2 text-muted-foreground">
        {pct}% to next level • Next Level: {nextXp} XP
      </p>
    </div>
  );
};

export default LevelProgress;
