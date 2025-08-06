import React, { useState, useEffect  } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUserPlus, FaUserCheck, FaSearch } from 'react-icons/fa';
// Add modal state
import { Fragment } from 'react';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followingStates, setFollowingStates] = useState({});
  // Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users?page=${page}&limit=12`);
      
      if (page === 1) {
        setUsers(response.data.users);
      } else {
        setUsers(prev => [...prev, ...response.data.users]);
      }
      
      setHasMore(response.data.currentPage < response.data.totalPages);
      
      // Initialize following states
      const newFollowingStates = {};
      response.data.users.forEach(user => {
        newFollowingStates[user._id] = currentUser?.following?.includes(user._id) || false;
      });
      setFollowingStates(prev => ({ ...prev, ...newFollowingStates }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    if (!currentUser) return;
    
    try {
      const isFollowing = followingStates[userId];
      
      if (isFollowing) {
        await axios.delete(`/api/users/${userId}/follow`);
        setFollowingStates(prev => ({ ...prev, [userId]: false }));
        toast.success('Unfollowed successfully');
      } else {
        await axios.post(`/api/users/${userId}/follow`);
        setFollowingStates(prev => ({ ...prev, [userId]: true }));
        toast.success('Followed successfully');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    }
  };

  // Handler to fetch and show followers/following list
  const handleShowList = async (userId, type) => {
    setModalTitle(type === 'followers' ? 'Followers' : 'Following');
    setModalOpen(true);
    setListLoading(true);
    setListUsers([]);
    try {
      const res = await axios.get(`/api/users/${userId}/${type}`);
      setListUsers(res.data[type]); // followers or following
    } catch (err) {
      toast.error('Failed to load list');
    } finally {
      setListLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.name || '';
    const email = user.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover People</h1>
        <p className="text-gray-600">Find and connect with other users on SocialHub</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map(user => (
          <div key={user._id} className="card p-6">
            <div className="text-center">
              {/* Profile Picture */}
              <Link to={`/users/${user._id}`}>
                <img
                  src={user.profilePicture || 'https://via.placeholder.com/80x80?text=U'}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 hover:opacity-80 transition-opacity"
                />
              </Link>

              {/* User Info */}
              <div className="mb-4">
                <Link 
                  to={`/users/${user._id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {user.name}
                </Link>
                {user.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center space-x-4 text-sm text-gray-500 mb-4">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => handleShowList(user._id, 'followers')}
                >
                  {user.followerCount || 0} followers
                </span>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => handleShowList(user._id, 'following')}
                >
                  {user.followingCount || 0} following
                </span>
              </div>

              {/* Follow Button */}
              {currentUser && currentUser._id !== user._id && (
                <button
                  onClick={() => handleFollow(user._id)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    followingStates[user._id]
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {followingStates[user._id] ? (
                    <FaUserCheck className="w-4 h-4" />
                  ) : (
                    <FaUserPlus className="w-4 h-4" />
                  )}
                  <span>{followingStates[user._id] ? 'Following' : 'Follow'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && page === 1 && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No users found' : 'No users available'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Check back later for new users'
            }
          </p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredUsers.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn btn-outline"
          >
            {loading ? 'Loading...' : 'Load More Users'}
          </button>
        </div>
      )}

      {/* Modal for followers/following list */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-h-[70vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">{modalTitle}</h2>
            {listLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : listUsers.length === 0 ? (
              <p className="text-gray-500 text-center">No users found.</p>
            ) : (
              <ul>
                {listUsers.map(u => (
                  <li key={u._id} className="mb-3 flex items-center">
                    <img src={u.profilePicture || 'https://via.placeholder.com/40x40?text=U'} alt={u.name} className="w-8 h-8 rounded-full mr-3" />
                    <span>{u.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 