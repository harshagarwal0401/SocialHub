import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEdit, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import PostCard from '../components/PostCard';
import UserListModal from '../components/UserListModal';

const Profile = () => {
  const { user, updateProfile, uploadProfilePicture } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/api/posts/user/${user._id}`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setUploadingImage(true);
      const result = await uploadProfilePicture(file);
      setUploadingImage(false);
      
      if (result.success) {
        fetchUserPosts(); 
      }
    }
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || ''
    });
    setEditing(false);
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

  const handleShowList = async (type) => {
    setModalTitle(type === 'followers' ? 'Followers' : 'Following');
    setShowModal(true);
    setModalLoading(true);
    setModalUsers([]);
    try {
      const res = await axios.get(`/api/users/${user._id}/${type}`);
      setModalUsers(res.data[type]); // followers or following
    } catch (err) {
      toast.error('Failed to load list');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={user?.profilePicture || 'https://via.placeholder.com/120x120?text=U'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
              <FaCamera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
            {uploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    maxLength="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="input resize-none"
                    rows="3"
                    maxLength="200"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/200 characters
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                </div>
                {user?.bio && (
                  <p className="text-gray-600 mb-4">{user.bio}</p>
                )}
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => handleShowList('followers')}
                  >
                    {user?.followerCount || 0} followers
                  </span>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => handleShowList('following')}
                  >
                    {user?.followingCount || 0} following
                  </span>
                  <span>{posts.length} posts</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Posts</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Start sharing your thoughts with the world!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <UserListModal
          title={modalTitle}
          users={modalUsers}
          loading={modalLoading}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Profile; 