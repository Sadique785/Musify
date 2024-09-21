import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaFileAlt } from 'react-icons/fa';

function AdminSidebar() {
  return (
    <div className="h-full w-1/4 bg-[#1A1F1F] text-white flex flex-col">
      {/* Logo and Name */}
      <div className="flex flex-col items-center py-8 border-b border-gray-600">
        <div className="flex items-center justify-center">
          <img src="/logo/logo_2.png" alt="Musify" className="w-10 h-10" />
          <h1 className="text-2xl font-bold ml-1 mr-9">MUSIFY</h1>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col mt-10 space-y-4">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 hover:bg-gray-700 transition ${
              isActive ? 'bg-gray-800' : ''
            }`
          }
        >
          <FaTachometerAlt className="mr-3" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 hover:bg-gray-700 transition ${
              isActive ? 'bg-gray-800' : ''
            }`
          }
        >
          <FaUsers className="mr-3" />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/content"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 hover:bg-gray-700 transition ${
              isActive ? 'bg-gray-800' : ''
            }`
          }
        >
          <FaFileAlt className="mr-3" />
          <span>Content</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default AdminSidebar;
