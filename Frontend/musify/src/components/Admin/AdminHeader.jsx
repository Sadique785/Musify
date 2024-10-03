import React, {useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import axiosInstance from "../../axios/adminInterceptor";



function AdminHeader() {
  const location = useLocation();
  const [adminProfileImage, setAdminProfileImage] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL


  const getPageTitle = () => {
    if (location.pathname === "/admin/dashboard") {
      return "Dashboard";
    } else if (location.pathname === "/admin/manage-users") {
      return "Manage Users";
    } else {
      return "Admin Panel";
    }
  };




  useEffect(() => {

    const fetchAdminProfileImage = async () => {
      try {
        const response = await axiosInstance.get("/admin-side/fetch-profile-image/")

        setAdminProfileImage(response.data.profileImage);

      }
      catch  (error) {
        console.error("Failed to fetch admin profile image:", error);

      }
    }
    fetchAdminProfileImage();

  }, [])

  return (
    <header className="w-full bg-[#060E0E] text-white py-4 px-8 flex justify-between items-center">
      <h1 className="text-4xl font-bold">{getPageTitle()}</h1>

      <div className="flex items-center space-x-4">
        <div className="bg-gray-700 p-2 rounded-full cursor-pointer">
          <FaSearch size={20} />
        </div>

        <div className="bg-gray-700 p-2 rounded-full cursor-pointer">
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
      </div>
    </header>
  );
}

export default AdminHeader;
