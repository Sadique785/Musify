import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import axiosInstance from '../../../axios/adminInterceptor';
import { useNavigate } from 'react-router-dom';
import UserLoader from '../Loaders/UserLoader';

function ManageUsers() {
  const [adminProfileImage, setAdminProfileImage] = useState('');
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [featuredUsers, setFeaturedUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate  = useNavigate();

  // useEffect to fetch users data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('sending request');
        
        const response = await axiosInstance.get('/admin-side/fetch-users/');
        const data = response.data;
        console.log(data);
        

        setAdminProfileImage(data.admin_profile_image);
        setTotalUsers(data.total_users);
        setActiveUsers(data.active_users);
        setFeaturedUsers(data.featured_users);
        setUsers(data.users || []); // Ensure users is set to an empty array if undefined
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data.'); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const seeDetails = (user) => {
    console.log('this is the user', user.id);
    navigate(`details/${user.id}`)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      <div className="flex-grow bg-[#060E0E] text-white flex flex-col">
        {/* AdminHeader */}
        <AdminHeader adminProfileImage={adminProfileImage} />

        {/* Main Content */}
        <div className="flex-grow p-10 relative overflow-y-auto">

          {/* Three sections */}

            {loading ? (
              <UserLoader />
            ) : (     
              <>

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
                            <h2 className="text-4xl font-bold">{featuredUsers ? {featuredUsers} : 0}</h2>
                            <p className="text-sm mt-2">Featured Users</p>
                          </div>
                        </div>
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
                    <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 table-auto">
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
                            
                            <td 
                              className="py-3 px-6 flex items-center cursor-pointer" // Add cursor pointer here
                              onClick={() => seeDetails(user)} // Redirect on click
                            >
                              <img 
                                src={user.profileImage || '/path-to-placeholder-image.jpg'} 
                                alt="User Profile" 
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <span>{user.username}</span>
                            </td>
                            <td className="py-3 px-6">
                              <span className={user.is_active ? 'text-green-500' : 'text-red-500'}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
        
                              <td className="py-3 px-6">{user.phone || 'N/A'}</td>
                              <td className="py-3 px-6">{user.role}</td>
                              <td className="py-3 px-6">
                                <div className="flex items-center justify-center">
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
              
              </>
        )}
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
