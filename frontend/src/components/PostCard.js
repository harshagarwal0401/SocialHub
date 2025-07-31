import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaEllipsisH,
  FaTrash,
  FaEdit,
  FaClock
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onLike, onDelete }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  const isLiked = post.likes?.some(like => like._id === user?._id);
  const isAuthor = post.author._id === user?._id;

  const handleLike = () => {
    onLike(post._id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post._id);
    }
    setShowMenu(false);
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="card p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/users/${post.author._id}`}>
            <img
              src={post.author.profilePicture || 'https://via.placeholder.com/40x40?text=U'}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link 
              to={`/users/${post.author._id}`}
              className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
            >
              {post.author.name}
            </Link>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <FaClock className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
              {post.isEdited && <span>• Edited</span>}
            </div>
          </div>
        </div>

        {/* Post Menu */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaEllipsisH className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <Link
                  to={`/posts/${post._id}/edit`}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <FaEdit className="w-3 h-3" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <FaTrash className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
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

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowLikes(!showLikes)}
            className="hover:text-primary-600 transition-colors"
          >
            {post.likeCount || 0} likes
          </button>
          <Link 
            to={`/posts/${post._id}`}
            className="hover:text-primary-600 transition-colors"
          >
            {post.commentCount || 0} comments
          </Link>
        </div>
      </div>

      {/* Likes Preview */}
      {showLikes && post.likes && post.likes.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <FaHeart className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Liked by</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.likes.slice(0, 5).map(like => (
              <Link
                key={like._id}
                to={`/users/${like._id}`}
                className="text-sm text-primary-600 hover:underline"
              >
                {like.name}
              </Link>
            ))}
            {post.likes.length > 5 && (
              <span className="text-sm text-gray-500">
                and {post.likes.length - 5} others
              </span>
            )}
          </div>
        </div>
      )}

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
          <span className="text-sm font-medium">Like</span>
        </button>

        <Link
          to={`/posts/${post._id}`}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <FaComment className="w-4 h-4" />
          <span className="text-sm font-medium">Comment</span>
        </Link>

        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
          <FaShare className="w-4 h-4" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard; 