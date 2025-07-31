import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('all'); // 'all' or 'following'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [feedType, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts?feed=${feedType}&page=${page}&limit=10`);
      
      if (page === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.posts]);
      }
      
      setHasMore(response.data.currentPage < response.data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      setPosts(prev => 
        prev.map(post => 
          post._id === postId ? response.data.post : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(prev => prev.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleCreatePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Feed Type Selector */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div className="flex">
            <button
              onClick={() => {
                setFeedType('all');
                setPage(1);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                feedType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => {
                setFeedType('following');
                setPage(1);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                feedType === 'following'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Following
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <img
              src="https://via.placeholder.com/40x40?text=U"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <span className="text-gray-500">What's on your mind?</span>
          </div>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading && page === 1 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {feedType === 'following' ? 'No posts from people you follow' : 'No posts yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {feedType === 'following' 
                ? 'Follow some users to see their posts here'
                : 'Be the first to share something!'
              }
            </p>
            {feedType === 'following' && (
              <Link
                to="/users"
                className="btn btn-primary"
              >
                Discover People
              </Link>
            )}
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onDelete={handleDeletePost}
            />
          ))
        )}

        {/* Load More Button */}
        {hasMore && posts.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Home; 