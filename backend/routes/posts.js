const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, upload.single('image'), [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Post content must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const post = new Post({
      author: req.user._id,
      content,
      image
    });

    await post.save();

    // Populate author info
    await post.populate('author', 'name profilePicture');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const feedType = req.query.feed || 'all'; // 'all', 'following'

    let query = {};
    
    // If following feed is requested, only show posts from followed users
    if (feedType === 'following') {
      const currentUser = await User.findById(req.user._id);
      query.author = { $in: currentUser.following };
    }

    const posts = await Post.find(query)
      .populate('author', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a single post
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Post content must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { content } = req.body;

    post.content = content;
    post.isEdited = true;
    await post.save();

    await post.populate('author', 'name profilePicture');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 1) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(like => like.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();
    await post.populate('likes', 'name profilePicture');

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      post
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by a specific user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Post.countDocuments({ author: req.params.userId });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 