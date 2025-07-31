const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment content must be between 1 and 500 characters'),
  body('postId').isMongoId().withMessage('Valid post ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, postId, parentCommentId } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      author: req.user._id,
      post: postId,
      content,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // If this is a reply, add it to parent comment's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    // Add comment to post's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });

    // Populate author info
    await comment.populate('author', 'name profilePicture');

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a specific post
// @access  Private
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null
    })
      .populate('author', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Comment.countDocuments({
      post: req.params.postId,
      parentComment: null
    });

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/:id
// @desc    Get a single comment
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ comment });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment content must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    const { content } = req.body;

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'name profilePicture');

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    // If this is a reply, remove it from parent comment's replies
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id }
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete the comment
    await Comment.findByIdAndDelete(comment._id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.toString() !== req.user._id.toString());
    } else {
      // Like
      comment.likes.push(req.user._id);
    }

    await comment.save();
    await comment.populate('likes', 'name profilePicture');

    res.json({
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      comment
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/:id/replies
// @desc    Get replies to a comment
// @access  Private
router.get('/:id/replies', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({ parentComment: req.params.id })
      .populate('author', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Comment.countDocuments({ parentComment: req.params.id });

    res.json({
      replies,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReplies: total
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 