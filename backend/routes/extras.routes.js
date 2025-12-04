import express from "express";
import {
  listMarketplace,
  getMarketplaceItem,
  createMarketplaceItem,

  listWriteups,
  getWriteup,
  createWriteup,

  listJobs,
  getJob,
  createJob,

  listKB,
  getKBArticle,
  createKBArticle,

  listBreachAlerts,
  createBreachAlert
} from "../controllers/extras.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Marketplace
router.get("/marketplace", listMarketplace);
router.get("/marketplace/:id", getMarketplaceItem);
router.post("/marketplace", protect, createMarketplaceItem);

// Writeups
router.get("/writeups", listWriteups);
router.get("/writeups/:id", getWriteup);
router.post("/writeups", protect, createWriteup);

// Jobs
router.get("/jobs", listJobs);
router.get("/jobs/:id", getJob);
router.post("/jobs", protect, createJob);

// Knowledge Base
router.get("/kb", listKB);
router.get("/kb/:slug", getKBArticle);
router.post("/kb", protect, createKBArticle);

// Breach Alerts
router.get("/breach-alerts", listBreachAlerts);
router.post("/breach-alerts", protect, createBreachAlert);

export default router;
