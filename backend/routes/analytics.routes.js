import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

import {
  // Hacker analytics
  getHackerSeverityStats,
  getHackerMonthlyActivity,
  getHackerAcceptanceStats,
  getHackerImpactScore,
  getHackerSummary,

  // Company analytics
  getCompanyReportFunnel,
  getCompanyRewardSummary,
  getCompanyTTR,
  getCompanyProgramInsights,

  // Admin analytics
  getAdminOverview,
  getAbuseDetection,

  // Leaderboards
  getSeasonalLeaderboard,
  getGlobalLeaderboard
} from "../controllers/analytics.controller.js";

const router = express.Router();

/* ─────────────────────────────
    ⭐ HACKER ANALYTICS
────────────────────────────── */
router.get("/hacker/severity", protect, getHackerSeverityStats);
router.get("/hacker/monthly", protect, getHackerMonthlyActivity);
router.get("/hacker/acceptance", protect, getHackerAcceptanceStats);
router.get("/hacker/impact", protect, getHackerImpactScore);
router.get("/hacker/summary", protect, getHackerSummary);

/* ─────────────────────────────
    ⭐ COMPANY ANALYTICS
────────────────────────────── */
router.get("/company/funnel", protect, getCompanyReportFunnel);
router.get("/company/rewards", protect, getCompanyRewardSummary);
router.get("/company/ttr", protect, getCompanyTTR);
router.get("/company/program-insights", protect, getCompanyProgramInsights);

/* ─────────────────────────────
    ⭐ ADMIN ANALYTICS
────────────────────────────── */
router.get(
  "/admin/overview",
  protect,
  authorizeRoles(["admin"]),
  getAdminOverview
);

router.get(
  "/admin/abuse",
  protect,
  authorizeRoles(["admin"]),
  getAbuseDetection
);

/* ─────────────────────────────
    ⭐ LEADERBOARDS
────────────────────────────── */
router.get("/leaderboard/seasonal", getSeasonalLeaderboard);
router.get("/leaderboard/global", getGlobalLeaderboard);

export default router;
