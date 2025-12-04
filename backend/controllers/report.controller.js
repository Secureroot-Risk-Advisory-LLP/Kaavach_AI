import Report from '../models/Report.model.js';
import Program from '../models/Program.model.js';
import User from '../models/User.model.js';

import {
  xpForSeverity,
  levelFromXp,
  tierFromLevel
} from '../utils/xpEngine.js';

import { createAndEmitNotification } from './notification.controller.js';
import mongoose from 'mongoose';

/* =====================================================================
   ⭐ Helper: Award XP, Level, Tier, Streak
===================================================================== */
async function awardXp(report) {
  try {
    if (report.status !== "accepted") return null;

    const severity = report.severity?.toLowerCase();
    const xpAwarded = xpForSeverity(severity);

    const user = await User.findById(report.submittedBy);
    if (!user) return null;

    // Add XP
    user.xp = (user.xp || 0) + xpAwarded;

    // Level
    user.level = levelFromXp(user.xp);

    // Tier
    user.tier = tierFromLevel(user.level);

    // Streak logic
    const now = new Date();
    if (user.lastActive) {
      const diffMs = now - new Date(user.lastActive);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      user.streak = diffDays <= 2 ? user.streak + 1 : 1;
    } else {
      user.streak = 1;
    }
    user.lastActive = now;

    await user.save();

    // Save XP to report
    report.xpAwarded = xpAwarded;
    await report.save();

    return xpAwarded;

  } catch (err) {
    console.error("XP award error:", err);
    return null;
  }
}

/* =====================================================================
   Submit Report (Hacker) + Real-Time Notify Company
===================================================================== */
export const submitReport = async (req, res) => {
  try {
    const { program, title, description, severity } = req.body;

    if (!program || !title || !description || !severity || !req.file) {
      return res.status(400).json({ message: 'Please provide all required fields and file' });
    }

    const programDoc = await Program.findById(program).populate("createdBy");
    if (!programDoc) return res.status(404).json({ message: 'Program not found' });

    if (programDoc.status !== 'active') {
      return res.status(400).json({ message: 'Program is not active' });
    }

    if (!programDoc.severityLevels.includes(severity)) {
      return res.status(400).json({ message: 'Severity not allowed for this program' });
    }

    const report = await Report.create({
      program,
      submittedBy: req.user._id,
      title,
      description,
      severity,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname
    });

    programDoc.reports.push(report._id);
    await programDoc.save();

    const populated = await Report.findById(report._id)
      .populate('program', 'title')
      .populate('submittedBy', 'name email xp level tier streak');

    /* 🔔 Real-Time Notification → Company */
    try {
      await createAndEmitNotification(
        programDoc.createdBy._id,
        `New report for ${programDoc.title}`,
        `${req.user.name} submitted a report.`,
        `/reports/${report._id}`,
        { reportId: report._id, programId: programDoc._id }
      );
    } catch (err) {
      console.error("Notification error (submitReport):", err);
    }

    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================================
   Get My Reports (Hacker)
===================================================================== */
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ submittedBy: req.user._id })
      .populate('program', 'title status')
      .sort({ createdAt: -1 });

    res.json(reports);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================================
   Company Reports (Company Dashboard)
===================================================================== */
export const getCompanyReports = async (req, res) => {
  try {
    const programs = await Program.find({ createdBy: req.user._id });
    const programIds = programs.map(p => p._id);

    const reports = await Report.find({ program: { $in: programIds } })
      .populate('program', 'title')
      .populate('submittedBy', 'name email points xp level tier streak')
      .sort({ createdAt: -1 });

    res.json(reports);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================================
   Get Single Report (Detailed View)
===================================================================== */
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('program', 'title description createdBy')
      .populate('submittedBy', 'name email xp level tier streak points')
      .populate('reviewedBy', 'name email');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json(report);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================================
   Update Report Status (Company/Admin) + XP Award + Notify Hacker
===================================================================== */
export const updateReportStatus = async (req, res) => {
  try {
    const { status, reward, reviewNotes } = req.body;

    let report = await Report.findById(req.params.id).populate("program");
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Authorization
    if (
      report.program.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prepare update object
    const updateData = {
      status,
      reviewedBy: req.user._id
    };

    if (reviewNotes) updateData.reviewNotes = reviewNotes;
    if (reward) updateData.reward = reward;

    // Legacy Points System
    if (status === "accepted" && reward) {
      updateData.rewardGiven = true;
      const severityPoints = {
        low: 10,
        medium: 25,
        high: 50,
        critical: 100
      };
      const pts = severityPoints[report.severity] || 0;
      await User.findByIdAndUpdate(report.submittedBy, { $inc: { points: pts } });
    }

    // Update report document
    report = await Report.findByIdAndUpdate(req.params.id, updateData, {
      new: true
    }).populate("submittedBy", "name email xp level tier streak points");

    /* ⭐ Award XP */
    let xpAwarded = null;
    if (status === "accepted") {
      xpAwarded = await awardXp(report);
    }

    /* 🔔 Real-Time Notification → Hacker */
    try {
      const hackerId =
        report.submittedBy?._id || report.submittedBy;

      await createAndEmitNotification(
        hackerId,
        `Report ${status}`,
        `Your report "${report.title}" was marked as ${status}.`,
        `/reports/${report._id}`,
        { reportId: report._id, status }
      );
    } catch (err) {
      console.error("Notification error (updateReportStatus):", err);
    }

    res.json({
      success: true,
      message: "Report updated successfully",
      report: report.toObject(),
      xpAwarded
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
