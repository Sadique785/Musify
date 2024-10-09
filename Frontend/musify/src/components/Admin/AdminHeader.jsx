import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaSearch, FaUserCircle, FaUser, FaSignOutAlt, FaSpinner } from 'react-icons/fa';  // Import FaSpinner for the loading icon
import axiosInstance from "../../axios/adminInterceptor";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/auth/Slices/authSlice";
import { persistor } from "../../redux/auth/userStore";

function AdminHeader({adminProfileImage}) {
  const location = useLocation();
  // const [adminProfileImage, setAdminProfileImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dropdownRef = useRef(null); // Ref for detecting clicks outside
  const navigate = useNavigate();  // For redirecting after logout
  const [loading, setLoading] = useState(false);  // State to track loading status

  const dispatch = useDispatch();

  const getPageTitle = () => {
    if (location.pathname === "/admin/dashboard") {
      return "Dashboard";
    } else if (location.pathname === "/admin/manage-users") {
      return "Manage Users";
      
    } else if (location.pathname.includes("details")) {
      return "User Details";
      
    } else {
      return "Admin Panel";
    }
  };

  // Fetch the admin profile image
  useEffect(() => {
    const fetchAdminProfileImage = async () => {
      try {
        const response = await axiosInstance.get("/admin-side/fetch-profile-image/");
        // setAdminProfileImage(response.data.profileImage);
      } catch (error) {
        console.error("Failed to fetch admin profile image:", error);
      }
    };
    fetchAdminProfileImage();
  }, []);

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);  // Close dropdown when clicked outside
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Handle logout logic here
  const handleLogout = async () => {
    setLoading(true);  // Start loading when the logout is triggered

    try {
        const response = await axiosInstance.post('/admin-side/admin-logout/');

        if (response.status === 200) {
            dispatch(logout());  
            console.log('Admin logout successful');

            await persistor.purge();
            console.log('Persistor cleared');

            navigate('/admin/login');
        } else {
            console.error('Admin logout failed', response.data);
        }
    } catch (error) {
        console.error('An error occurred during admin logout: ', error);
    } finally {
      setLoading(false);  // Stop loading after the API call completes
  }

    console.log('Admin logout triggered');
};


  const handleProfileClick = (event) => {
    event.stopPropagation(); 
    setIsDropdownOpen(!isDropdownOpen);
  };




  return (
    <header className="w-full bg-[#060E0E] text-white py-4 px-8 flex justify-between items-center">
      <h1 className="text-4xl font-bold">{getPageTitle()}</h1>

      <div className="flex items-center space-x-4 relative">
        <div className="bg-gray-700 p-2 rounded-full cursor-pointer">
          <FaSearch size={20} />
        </div>

        <div 
          className="bg-gray-700 p-2 rounded-full cursor-pointer relative" 
          onClick={handleProfileClick}  // Toggle dropdown
        >
          {adminProfileImage ? (
            <img
              src={`${backendUrl}${adminProfileImage}`}
              alt="Admin Profile"
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <FaUserCircle size={32} />
          )}
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div 
            ref={dropdownRef} 
            className="absolute right-0 mt-2 w-48 bg-[#737777] text-white rounded-md shadow-lg z-50"
            style={{ top: "100%" }}
          >
            <ul>
              <li 
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-600 hover:text-[#36B9B7] hover:rounded-md transition-colors duration-300"
                onClick={(e) => {
                  e.stopPropagation();  // Prevent dropdown from closing
                  navigate('/admin/profile');  // Navigate to profile
                }}
              >
                <FaUser className="mr-2" />  {/* Icon for Profile */}
                Profile
              </li>
              <li 
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-600 hover:text-[#36B9B7] hover:rounded-md transition-colors duration-300"
                onClick={(e) => {
                  e.stopPropagation();  // Prevent dropdown from closing
                  handleLogout();  // Trigger logout logic
                }}
              >
                <FaSignOutAlt className="mr-2" /> 
                {loading ? (
                  <div className="flex items-center">

                    Logging out <FaSpinner className="animate-spin ml-2"/>
                  </div>
                ) : (
                  'Logout'
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;
