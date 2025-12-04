import User from '../models/User.model.js';
import Program from '../models/Program.model.js';
import Feed from '../models/Feed.model.js';
import Report from '../models/Report.model.js';

// @desc    Get all users
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject company
// @route   PUT /api/admin/users/:id/approve
export const approveCompany = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }

    user.isApproved = isApproved;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHackers = await User.countDocuments({ role: 'hacker' });
    const totalCompanies = await User.countDocuments({ role: 'company' });
    const totalPrograms = await Program.countDocuments();
    const totalReports = await Report.countDocuments();
    const activePrograms = await Program.countDocuments({ status: 'active' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalHackers,
      totalCompanies,
      totalPrograms,
      totalReports,
      activePrograms,
      pendingReports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

