import express from "express";
import {
  getGlobalLeaderboard,
  getSeasonalLeaderboard,
  getCountryLeaderboard
} from "../controllers/leaderboardAnalytics.controller.js";

const router = express.Router();

router.get("/global", getGlobalLeaderboard);
router.get("/seasonal", getSeasonalLeaderboard);
router.get("/country/:country", getCountryLeaderboard);

export default router;
