// backend/controllers/analytics.controller.js
import mongoose from "mongoose";
import Report from "../models/Report.model.js";
import Program from "../models/Program.model.js";
import User from "../models/User.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

/* ===========================================================
   ⭐ HACKER ANALYTICS (Hybrid Pro)
=========================================================== */

// 1. Severity Distribution
export const getHackerSeverityStats = async (req, res) => {
  try {
    const hackerId = toObjectId(req.user._id);

    const stats = await Report.aggregate([
      { $match: { submittedBy: hackerId } },
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching severity stats" });
  }
};

// 2. Monthly Activity
export const getHackerMonthlyActivity = async (req, res) => {
  try {
    const hackerId = toObjectId(req.user._id);

    const stats = await Report.aggregate([
      { $match: { submittedBy: hackerId } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly activity" });
  }
};

// 3. Acceptance vs Rejected
export const getHackerAcceptanceStats = async (req, res) => {
  try {
    const hackerId = toObjectId(req.user._id);

    const stats = await Report.aggregate([
      { $match: { submittedBy: hackerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching acceptance stats" });
  }
};

// 4. Impact Score
export const getHackerImpactScore = async (req, res) => {
  try {
    const hackerId = toObjectId(req.user._id);

    const reports = await Report.find({ submittedBy: hackerId, status: "accepted" });

    let impact = 0;
    reports.forEach((r) => {
      if (r.severity === "critical") impact += 50;
      if (r.severity === "high") impact += 30;
      if (r.severity === "medium") impact += 15;
      if (r.severity === "low") impact += 5;
    });

    res.json({ impactScore: impact });
  } catch (error) {
    res.status(500).json({ message: "Error calculating impact score" });
  }
};

// 5. Hacker Summary (Hybrid Pro)
export const getHackerSummary = async (req, res) => {
  try {
    const hackerId = toObjectId(req.user._id);

    const [accepted, total, rewards, distinctPrograms, user] = await Promise.all([
      Report.countDocuments({ submittedBy: hackerId, status: "accepted" }),
      Report.countDocuments({ submittedBy: hackerId }),
      Report.aggregate([
        { $match: { submittedBy: hackerId, status: "accepted" } },
        { $group: { _id: null, total: { $sum: "$reward" } } }
      ]),
      Report.distinct("program", { submittedBy: hackerId }),
      User.findById(hackerId).select("xp level streak badges impactScore")
    ]);

    res.json({
      accepted,
      total,
      totalRewards: rewards[0]?.total || 0,
      programsContributed: distinctPrograms.length,
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching hacker summary" });
  }
};

/* ===========================================================
   ⭐ COMPANY ANALYTICS (Hybrid Pro)
=========================================================== */

// 1. Report Funnel
export const getCompanyReportFunnel = async (req, res) => {
  try {
    const companyId = toObjectId(req.user._id);

    const funnel = await Report.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json(funnel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching funnel stats" });
  }
};

// 2. Reward Summary
export const getCompanyRewardSummary = async (req, res) => {
  try {
    const companyId = toObjectId(req.user._id);

    const rewards = await Report.aggregate([
      { $match: { company: companyId, status: "accepted" } },
      {
        $group: {
          _id: null,
          totalRewards: { $sum: "$reward" },
          avgReward: { $avg: "$reward" }
        }
      }
    ]);

    res.json(rewards[0] || { totalRewards: 0, avgReward: 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reward stats" });
  }
};

// 3. Time To Resolve (TTR)
export const getCompanyTTR = async (req, res) => {
  try {
    const companyId = toObjectId(req.user._id);

    const stats = await Report.aggregate([
      { $match: { company: companyId, status: "accepted" } },
      {
        $project: {
          diff: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 3600 * 24
            ]
          }
        }
      },
      { $group: { _id: null, avgTTR: { $avg: "$diff" } } }
    ]);

    res.json(stats[0] || { avgTTR: 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching TTR" });
  }
};

// 4. Program Insights (Hybrid Pro)
export const getCompanyProgramInsights = async (req, res) => {
  try {
    const companyId = toObjectId(req.user._id);

    const insights = await Report.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: "$program",
          total: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] }
          },
          avgReward: { $avg: "$reward" }
        }
      },
      {
        $lookup: {
          from: "programs",
          localField: "_id",
          foreignField: "_id",
          as: "program"
        }
      },
      { $unwind: "$program" }
    ]);

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: "Error fetching program insights" });
  }
};

/* ===========================================================
   ⭐ ADMIN ANALYTICS (Hybrid Pro)
=========================================================== */

// 1. Admin Overview Dashboard
export const getAdminOverview = async (req, res) => {
  try {
    const [
      hackers,
      companies,
      programs,
      reports
    ] = await Promise.all([
      User.countDocuments({ role: "hacker" }),
      User.countDocuments({ role: "company" }),
      Program.countDocuments(),
      Report.countDocuments()
    ]);

    const now = new Date();
    const last24 = new Date(now - 24 * 3600 * 1000);
    const last30 = new Date(now - 30 * 24 * 3600 * 1000);

    const dau = await Report.distinct("submittedBy", { createdAt: { $gte: last24 } });
    const mau = await Report.distinct("submittedBy", { createdAt: { $gte: last30 } });

    res.json({
      hackers,
      companies,
      programs,
      reports,
      dau: dau.length,
      mau: mau.length
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin analytics" });
  }
};

// 2. Abuse Detection
export const getAbuseDetection = async (req, res) => {
  try {
    const result = await Report.aggregate([
      {
        $group: {
          _id: "$submittedBy",
          total: { $sum: 1 },
          bad: {
            $sum: {
              $cond: [{ $in: ["$status", ["duplicate", "rejected"]] }, 1, 0]
            }
          }
        }
      },
      {
        $match: {
          total: { $gte: 5 },
          $expr: { $gte: ["$bad", { $multiply: ["$total", 0.5] }] }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching abuse detection" });
  }
};

/* ===========================================================
   ⭐ LEADERBOARD ANALYTICS
=========================================================== */

// Seasonal Leaderboard (XP-based)
export const getSeasonalLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: "hacker" })
      .sort({ xp: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seasonal leaderboard" });
  }
};

// Global Leaderboard (ImpactScore-based)
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: "hacker" })
      .sort({ impactScore: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching global leaderboard" });
  }
};
