import React from 'react';

const UserListModal = ({ title, users, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center" onClick={onClose}>
    <div
      className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative"
      onClick={e => e.stopPropagation()}
    >
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <button
        className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
      <ul>
        {users.length === 0 ? (
          <li className="text-gray-500">No users found.</li>
        ) : (
          users.map(user => (
            <li key={user._id} className="py-2 border-b">
              <div className="flex items-center space-x-2">
                <img src={user.profilePicture || 'https://via.placeholder.com/32'} alt={user.name} className="w-8 h-8 rounded-full" />
                <a href={`/users/${user._id}`} className="hover:underline">{user.name}</a>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  </div>
);

export default UserListModal;
