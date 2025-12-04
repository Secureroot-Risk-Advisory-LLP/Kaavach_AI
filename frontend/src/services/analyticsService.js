// frontend/src/services/analyticsService.js
import api from "./api"; // axios instance

export const analyticsService = {
  /* ===============================
     ⭐ HACKER ANALYTICS
  ================================ */
  getSeverityStats: () => api.get("/analytics/hacker/severity"),
  getMonthlyActivity: () => api.get("/analytics/hacker/monthly"),
  getAcceptanceStats: () => api.get("/analytics/hacker/acceptance"),
  getImpactScore: () => api.get("/analytics/hacker/impact"),
  getHackerSummary: () => api.get("/analytics/hacker/summary"),

  /* ===============================
     ⭐ COMPANY ANALYTICS
  ================================ */
  getCompanyReportFunnel: () => api.get("/analytics/company/funnel"),
  getCompanyRewardSummary: () => api.get("/analytics/company/rewards"),
  getCompanyTTR: () => api.get("/analytics/company/ttr"),
  getCompanyProgramInsights: () =>
    api.get("/analytics/company/program-insights"),

  /* ===============================
     ⭐ ADMIN ANALYTICS
  ================================ */
  getAdminOverview: () => api.get("/analytics/admin/overview"),
  getAbuseDetection: () => api.get("/analytics/admin/abuse"),

  /* ===============================
     ⭐ LEADERBOARDS
  ================================ */
  getSeasonalLeaderboard: () =>
    api.get("/analytics/leaderboard/seasonal"),

  getGlobalLeaderboard: () =>
    api.get("/analytics/leaderboard/global"),
};
