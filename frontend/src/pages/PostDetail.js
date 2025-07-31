import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaArrowLeft,
  FaReply,
  FaEdit,
  FaTrash,
  FaClock
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/post/${id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/posts/${id}/like`);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        content: newComment,
        postId: id
      });
      
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        content: replyContent,
        postId: id,
        parentCommentId: replyingTo._id
      });
      
      // Refresh comments to show the new reply
      fetchComments();
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(`/api/comments/${commentId}/like`);
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId ? response.data.comment : comment
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-500">The post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isLiked = post.likes?.some(like => like._id === user?._id);
  const isAuthor = post.author._id === user?._id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Post</h1>
      </div>

      {/* Post */}
      <div className="card p-6 mb-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.profilePicture || 'https://via.placeholder.com/40x40?text=U'}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-medium text-gray-900">{post.author.name}</div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <FaClock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.isEdited && <span>• Edited</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="mt-3 rounded-lg w-full max-h-96 object-cover"
            />
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isLiked
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isLiked ? (
              <FaHeart className="w-4 h-4" />
            ) : (
              <FaRegHeart className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {post.likeCount || 0} likes
            </span>
          </button>

          <div className="flex items-center space-x-2 px-3 py-2 text-gray-600">
            <FaComment className="w-4 h-4" />
            <span className="text-sm font-medium">
              {comments.length} comments
            </span>
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <FaShare className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>

        {/* Add Comment */}
        <form onSubmit={handleComment} className="mb-6">
          <div className="flex space-x-3">
            <img
              src={user?.profilePicture || 'https://via.placeholder.com/32x32?text=U'}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="2"
                maxLength="500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {newComment.length}/500 characters
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex space-x-3">
                <img
                  src={comment.author.profilePicture || 'https://via.placeholder.com/32x32?text=U'}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{comment.author.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {comment.author._id === user?._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-900 mt-1">{comment.content}</p>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center space-x-1 text-sm ${
                        comment.likes?.some(like => like._id === user?._id)
                          ? 'text-red-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FaHeart className="w-3 h-3" />
                      <span>{comment.likeCount || 0}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(comment)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <FaReply className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo?._id === comment._id && (
                    <form onSubmit={handleReply} className="mt-3">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows="2"
                        maxLength="500"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!replyContent.trim()}
                          className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          Reply
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-4 space-y-3">
                      {comment.replies.map(reply => (
                        <div key={reply._id} className="border-l-2 border-gray-200 pl-3">
                          <div className="flex items-center space-x-2">
                            <img
                              src={reply.author.profilePicture || 'https://via.placeholder.com/24x24?text=U'}
                              alt={reply.author.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-900 text-sm mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail; 