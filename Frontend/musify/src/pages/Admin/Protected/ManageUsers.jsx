import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import axios from '../../../axios/adminInterceptor';

function ManageUsers() {
  const [adminProfileImage, setAdminProfileImage] = useState('');
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [featuredUsers, setFeaturedUsers] = useState(0);
  const [error, setError] = useState(null); // State for error handling

  // useEffect to fetch users data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('sending request');
        
        const response = await axios.get('/admin-side/fetch-users/');
        const data = response.data;
        console.log(data);
        
        
        // Assuming data has the structure:
        // { adminProfileImage: '', totalUsers: 0, activeUsers: 0, featuredUsers: 0, users: [] }
        
        setAdminProfileImage(data.admin_profile_image);
        setTotalUsers(data.total_users);
        setActiveUsers(data.active_users);
        setFeaturedUsers(data.featured_users);
        setUsers(data.users || []); // Ensure users is set to an empty array if undefined
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data.'); // Set error message
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="w-3/4 bg-[#060E0E] text-white p-10 relative">
        {/* Profile Image */}
        <div className="absolute top-4 right-4">
          <img 
            src={adminProfileImage || '/path-to-placeholder-image.jpg'} 
            alt="Admin Profile" 
            className="w-12 h-12 rounded-full border-2 border-gray-500"
          />
        </div>

        <h1 className="text-3xl font-bold mb-16">User Managing</h1>

        {/* Three sections */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="text-center border-r border-gray-600 pr-6">
            <h2 className="text-4xl font-bold">{totalUsers}</h2>
            <p className="text-sm mt-2">Total Users</p>
          </div>
          <div className="text-center border-r border-gray-600 pr-6">
            <h2 className="text-4xl font-bold">{activeUsers}</h2>
            <p className="text-sm mt-2">Active Users</p>
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold">{featuredUsers}</h2>
            <p className="text-sm mt-2">Featured Users</p>
          </div>
        </div>

        {/* Search bar and button */}
        <div className="flex mb-6">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-gray-800 text-white p-2 flex-grow rounded-l-md border border-gray-600 focus:outline-none"
          />
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-r-md">
            Search
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800">
            <thead>
              <tr className="text-left border-b border-gray-600">
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Is Admin</th>
                <th className="py-3 px-6">Last Logged In</th>
              </tr>
            </thead>
            <tbody>
  {users.length > 0 ? (
    users.map((user, index) => (
      <tr key={index} className="border-b border-gray-700">
        <td className="py-3 px-6 flex items-center">
          <img 
            src={user.profileImage || '/path-to-placeholder-image.jpg'} 
            alt="User Profile" 
            className="w-8 h-8 rounded-full mr-3"
          />
          <span>{user.username}</span>
        </td>
        <td className="py-3 px-6">
          {/* Conditionally render the status based on is_active */}
          <span className={user.is_active ? 'text-green-500' : 'text-red-500'}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="py-3 px-6">{user.phone || 'N/A'}</td>
        <td className="py-3 px-6">{user.role}</td>
        <td className="py-3 px-6">
          <div className="flex items-center justify-center">
            {/* Conditionally render the admin status based on is_admin */}
            {user.is_admin ? (
              <span className="text-green-500 bg-green-700 rounded-full w-6 h-6 flex items-center justify-center">✓</span>
            ) : (
              <span className="text-red-500 bg-red-700 rounded-full w-6 h-6 flex items-center justify-center">✕</span>
            )}
          </div>
        </td>
        <td className="py-3 px-6">{user.last_logged_in || 'N/A'}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center py-3">No users found.</td>
    </tr>
  )}
</tbody>

          </table>
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </div>
  );
}

export default ManageUsers;
