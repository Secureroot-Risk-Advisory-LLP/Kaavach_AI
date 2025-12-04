import Feed from '../models/Feed.model.js';

// @desc    Get all feed posts
// @route   GET /api/feed
export const getFeed = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };
    
    if (type) {
      query.type = type;
    }

    const posts = await Feed.find(query)
      .populate('author', 'name email role avatar companyName')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feed.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create feed post
// @route   POST /api/feed
export const createPost = async (req, res) => {
  try {
    const { type, title, content, image, jobDetails } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const postData = {
      author: req.user._id,
      type,
      title,
      content
    };

    if (image) postData.image = image;
    if (jobDetails) postData.jobDetails = jobDetails;

    const post = await Feed.create(postData);
    const populatedPost = await Feed.findById(post._id)
      .populate('author', 'name email role avatar companyName');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/feed/:id/like
export const toggleLike = async (req, res) => {
  try {
    const post = await Feed.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();
    const updatedPost = await Feed.findById(req.params.id)
      .populate('author', 'name email role avatar companyName')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment
// @route   POST /api/feed/:id/comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Feed.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text
    });

    await post.save();
    const updatedPost = await Feed.findById(req.params.id)
      .populate('author', 'name email role avatar companyName')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/feed/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Feed.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.isDeleted = true;
    await post.save();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

