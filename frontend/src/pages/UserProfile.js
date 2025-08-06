import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUserPlus, FaUserCheck, FaUsers, FaHeart } from 'react-icons/fa';
import PostCard from '../components/PostCard';
import UserListModal from '../components/UserListModal';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
const [modalTitle, setModalTitle] = useState('');
const [modalUsers, setModalUsers] = useState([]);

const handleShowFollowers = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${id}/followers`);
    setModalTitle('Followers');
    setModalUsers(res.data.followers);
    setShowModal(true);
  } catch (err) {
    toast.error('Failed to load followers');
  }
};

const handleShowFollowing = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${id}/following`);
    setModalTitle('Following');
    setModalUsers(res.data.following);
    setShowModal(true);
  } catch (err) {
    toast.error('Failed to load following');
  }
};


  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${id}`);
      setUser(response.data.user);
      setPosts(response.data.posts);
      
      // Check if current user is following this user
      if (currentUser) {
        setFollowing(currentUser.following?.includes(id));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    
    setFollowLoading(true);
    try {
      if (following) {
        await axios.delete(`/api/users/${id}/follow`);
        setFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        await axios.post(`/api/users/${id}/follow`);
        setFollowing(true);
        toast.success('Followed successfully');
      }
      
      // Refresh user data to update follower count
      fetchUserProfile();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-500">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div>
            <img
              src={user.profilePicture || 'https://via.placeholder.com/120x120?text=U'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.bio && (
                  <p className="text-gray-600 mt-1">{user.bio}</p>
                )}
              </div>
              
              {!isOwnProfile && currentUser && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    following
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  } disabled:opacity-50`}
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : following ? (
                    <FaUserCheck className="w-4 h-4" />
                  ) : (
                    <FaUserPlus className="w-4 h-4" />
                  )}
                  <span>{following ? 'Following' : 'Follow'}</span>
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
  <div className="flex items-center space-x-1 cursor-pointer" onClick={handleShowFollowers}>
    <FaUsers className="w-4 h-4" />
    <span>{user.followerCount || 0} followers</span>
  </div>
  <div className="flex items-center space-x-1 cursor-pointer" onClick={handleShowFollowing}>
    <FaUsers className="w-4 h-4" />
    <span>{user.followingCount || 0} following</span>
  </div>
  <div className="flex items-center space-x-1">
    <FaHeart className="w-4 h-4" />
    <span>{posts.length} posts</span>
  </div>
</div>


            {/* Member Since */}
            <div className="mt-4 text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`}
        </h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? 'No posts yet' : 'No posts yet'}
            </h3>
            <p className="text-gray-500">
              {isOwnProfile 
                ? 'Start sharing your thoughts with the world!'
                : `${user.name} hasn't shared any posts yet.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDelete={() => {}} // Users can't delete others' posts
              />
            ))}
          </div>
        )}
      </div>
      {showModal && (
  <UserListModal
    title={modalTitle}
    users={modalUsers}
    onClose={() => setShowModal(false)}
  />
)}

    </div>
  );
};

export default UserProfile; 