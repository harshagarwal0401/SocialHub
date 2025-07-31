import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHome, 
  FaUser, 
  FaUsers, 
  FaPlus, 
  FaSignOutAlt, 
  FaCog,
  FaChevronDown,
  FaBell
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SocialHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FaHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link 
              to="/users" 
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FaUsers className="w-4 h-4" />
              <span>Discover</span>
            </Link>
            <Link 
              to="/create-post" 
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative">
              <FaBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/32x32?text=U'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <FaChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaCog className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link 
            to="/" 
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaHome className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link 
            to="/users" 
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaUsers className="w-5 h-5" />
            <span className="text-xs">Discover</span>
          </Link>
          <Link 
            to="/create-post" 
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaPlus className="w-5 h-5" />
            <span className="text-xs">Create</span>
          </Link>
          <Link 
            to="/profile" 
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaUser className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 