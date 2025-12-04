import User from '../models/User.model.js';
import Report from '../models/Report.model.js';

// @desc    Get leaderboard
// @route   GET /api/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const hackers = await User.find({ role: 'hacker' })
      .select('name email points rank badges avatar')
      .sort({ points: -1 })
      .limit(100);

    // Update ranks
    for (let i = 0; i < hackers.length; i++) {
      hackers[i].rank = i + 1;
      await hackers[i].save();
    }

    res.json(hackers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get hacker stats
// @route   GET /api/leaderboard/my-stats
export const getMyStats = async (req, res) => {
  try {
    const reports = await Report.find({ submittedBy: req.user._id });
    
    const stats = {
      totalReports: reports.length,
      acceptedReports: reports.filter(r => r.status === 'accepted').length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      totalRewards: reports.reduce((sum, r) => sum + (r.reward || 0), 0),
      points: req.user.points,
      rank: req.user.rank,
      badges: req.user.badges || []
    };

    // Calculate badges
    const badges = [];
    if (stats.acceptedReports >= 10) badges.push('Expert');
    if (stats.acceptedReports >= 5) badges.push('Professional');
    if (stats.acceptedReports >= 1) badges.push('Beginner');
    if (stats.points >= 500) badges.push('Elite');
    if (stats.points >= 200) badges.push('Master');
    if (stats.points >= 100) badges.push('Advanced');

    // Update user badges
    if (badges.length > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: { badges: [...new Set([...req.user.badges || [], ...badges])] }
      });
      stats.badges = [...new Set([...req.user.badges || [], ...badges])];
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

