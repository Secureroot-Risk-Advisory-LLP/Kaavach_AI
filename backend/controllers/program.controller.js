import Program from '../models/Program.model.js';

// @desc    Get all programs
// @route   GET /api/programs
export const getPrograms = async (req, res) => {
  try {
    const { severity, status, page = 1, limit = 5 } = req.query;
    const query = {};

    if (severity) {
      query.severityLevels = { $in: [severity] };
    }
    if (status) {
      query.status = status;
    }

    const programs = await Program.find(query)
      .populate('createdBy', 'name companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Program.countDocuments(query);

    res.json({
      programs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
export const getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('createdBy', 'name companyName companyWebsite')
      .populate('reports');

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create program
// @route   POST /api/programs
export const createProgram = async (req, res) => {
  try {
    const { title, description, rules, severityLevels, rewardRange } = req.body;

    if (!title || !description || !rules || !severityLevels || !rewardRange) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const program = await Program.create({
      title,
      description,
      rules,
      severityLevels,
      rewardRange,
      createdBy: req.user._id
    });

    const populatedProgram = await Program.findById(program._id)
      .populate('createdBy', 'name companyName');

    res.status(201).json(populatedProgram);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
export const updateProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Check if user is creator or admin
    if (program.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProgram = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name companyName');

    res.json(updatedProgram);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Check if user is creator or admin
    if (program.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Program.findByIdAndDelete(req.params.id);

    res.json({ message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

