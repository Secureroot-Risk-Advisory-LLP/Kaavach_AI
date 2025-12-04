import User from '../models/User.model.js';
import Report from '../models/Report.model.js';
import mongoose from 'mongoose';

// ---------- GLOBAL LEADERBOARD ----------
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { role: "hacker" } },
      {
        $project: {
          name: 1,
          avatar: 1,
          xp: 1,
          level: 1,
          streak: 1,
          impactScore: 1,
          badges: 1,
          points: 1,
          email: 1
        }
      },
      { $sort: { xp: -1 } },
      { $limit: 100 }
    ]);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
};


// ---------- SEASONAL LEADERBOARD ----------
export const getSeasonalLeaderboard = async (req, res) => {
  try {
    const startOfSeason = new Date();
    startOfSeason.setMonth(startOfSeason.getMonth() - 3); // last 3 months

    const seasonal = await Report.aggregate([
      { $match: { createdAt: { $gte: startOfSeason }, status: "accepted" } },
      {
        $group: {
          _id: "$submittedBy",
          reports: { $sum: 1 },
          reward: { $sum: "$reward" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "hacker"
        }
      },
      { $unwind: "$hacker" },
      {
        $project: {
          name: "$hacker.name",
          avatar: "$hacker.avatar",
          reward: 1,
          reports: 1,
          xp: "$hacker.xp",
          level: "$hacker.level",
          badges: "$hacker.badges"
        }
      },
      { $sort: { reward: -1 } },
      { $limit: 50 }
    ]);

    res.json(seasonal);
  } catch (err) {
    res.status(500).json({ message: "Failed to load seasonal leaderboard" });
  }
};


// ---------- COUNTRY LEADERBOARD ----------
export const getCountryLeaderboard = async (req, res) => {
  try {
    const { country } = req.params;

    const users = await User.find({ role: "hacker", country })
      .sort({ xp: -1 })
      .limit(50);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Country leaderboard unavailable" });
  }
};
