import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import axiosInstance from '../../../axios/adminInterceptor';
import { useNavigate } from 'react-router-dom';
import UserLoader from '../Loaders/UserLoader';
import debounce from "lodash.debounce";
import FilterComponent from '../../../components/Admin/InnerComponents/FilterComponent';


function ManageUsers() {
  const [adminProfileImage, setAdminProfileImage] = useState('');
  const [users, setUsers] = useState([]); 
  const [searchResults, setSearchResults] = useState([]); // Holds the results of search
  const [filteredUsers, setFilteredUsers] = useState([]); // Holds the results after filtering
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [featuredUsers, setFeaturedUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All"); // Track the selected filter


  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // useEffect to fetch users data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/admin-side/fetch-users/');
        const data = response.data;
        
        setAdminProfileImage(data.admin_profile_image);
        setTotalUsers(data.total_users);
        setActiveUsers(data.active_users);
        setFeaturedUsers(data.featured_users);
        setUsers(data.users || []); // Initialize users and both filtered states
        setSearchResults(data.users || []);
        setFilteredUsers(data.users || []);

      } catch (error) {
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const seeDetails = (user) => {
    navigate(`details/${user.id}`);
  };

  const handleSearch = useCallback(
    debounce((term) => {
      const lowerCaseTerm = term.toLowerCase();
      const results = users.filter(user =>
        user.username.toLowerCase().includes(lowerCaseTerm)
      );
      setSearchResults(results);  // Update the search results
      setFilteredUsers(results); // Apply any current search term as the base for future filtering
    }, 300),
    [users]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
    setSelectedFilter("All");

  };

  const filterUsers = (filter) => {
    let filteredList = searchResults; // Start filtering from the latest search results

    if (filter === 'Active'){
      filteredList = searchResults.filter((user) => user.is_active);
    } else if (filter === 'Inactive'){
      filteredList = searchResults.filter((user) => !user.is_active);
    } else if (filter === 'Admin'){
      filteredList = searchResults.filter((user) => user.is_admin);
    } else if (filter === 'User') {
      filteredList = searchResults.filter((user) => !user.is_admin);
    }
    setFilteredUsers(filteredList); // Set final filtered list
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-grow bg-[#060E0E] text-white flex flex-col">
        <AdminHeader />

        <div className="flex-grow p-10 relative overflow-y-auto scrollbar-hidden">
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
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white p-2 flex-grow rounded-md border border-gray-600 focus:outline-none"
                />
                <FilterComponent onFilterSelect={filterUsers} setSelectedFilter={setSelectedFilter} selectedFilter={selectedFilter} />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full rounded-md bg-gray-800 table-fixed">
                  <thead>
                    <tr className="text-left border-b border-gray-600">
                      <th className="py-3 px-6 w-1/4">User</th>
                      <th className="py-3 px-6 w-1/7">Status</th>
                      <th className="py-3 px-6 w-1/5" >Email</th>
                      <th className="py-3 px-6 w-1/7 ">Role</th>
                      <th className="py-3 px-6 w-1/7">Is Admin</th>
                      <th className="py-3 px-6 w-1/6">Last Logged In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td 
                            className="py-3 px-6 flex items-center cursor-pointer" 
                            onClick={() => seeDetails(user)}
                          >
                            <img 
                              src={user.profile_image ? `${backendUrl}${user.profile_image}` : '/logo/user1.png'}
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
                          <td className="py-3 px-6">{user.email || 'N/A'}</td>
                          <td className="py-3 px-6">{user.user_role.charAt(0).toUpperCase() + user.user_role.slice(1)}</td>
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

