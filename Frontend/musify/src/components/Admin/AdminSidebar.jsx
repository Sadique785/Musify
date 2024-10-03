import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaFileAlt } from 'react-icons/fa';

function AdminSidebar() {
  return (
    <div className="h-full w-1/5 bg-[#1A1F1F] text-white flex flex-col">
      {/* Logo and Name */}
      <div className="flex flex-col items-center py-8 border-b border-gray-600">
        <div className="flex items-center justify-center">
          <img src="/logo/logo_2.png" alt="Musify" className="w-14 h-14" />
          <h1 className="text-3xl font-bold ml-[-10px] mr-9">MUSIFY</h1>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col mt-10  px-6">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 transition ${
              isActive ? 'bg-transparent' : ''
            }`
          }
        >
          {({ isActive }) => (
            <div
              className={`flex items-center space-x-3 px-4  w-96 h-12 rounded-lg transition-all ${
                isActive ? 'bg-gray-700 rounded-lg text-[#36B9B7]' : 'hover:bg-gray-600'
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              <span>Dashboard</span>
            </div>
          )}
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 transition ${
              isActive ? 'bg-transparent' : ''
            }`
          }
        >
          {({ isActive }) => (
            <div
              className={`flex items-center space-x-3 px-4   w-96 h-12 rounded-lg transition-all ${
                isActive ? 'bg-gray-700 rounded-lg text-[#36B9B7]' : 'hover:bg-gray-600'
              }`}
            >
              <FaUsers className="mr-3" />
              <span>Users</span>
            </div>
          )}
        </NavLink>

        <NavLink
          to="/admin/content"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 transition ${
              isActive ? 'bg-transparent ' : ''
            }`
          }
        >
          {({ isActive }) => (
            <div
              className={`flex items-center space-x-3 px-4 w-96 h-12 rounded-lg transition-all ${
                isActive ? 'bg-gray-700 rounded-lg text-[#36B9B7]' : 'hover:bg-gray-600'
              }`}
            >
              <FaFileAlt className="mr-3" />
              <span>Content</span>
            </div>
          )}
        </NavLink>
      </nav>
    </div>
  );
}

export default AdminSidebar;
