import React from "react";
import { NavLink, Link } from "react-router-dom";
import { FaPlus, FaHome, FaSearch, FaCompass, FaStar, FaBell, FaCommentDots, FaUser } from "react-icons/fa";

function UserHeader() {
  return (
    <header className="bg-white fixed w-full transition duration-200 p-2 z-50 shadow-md">
      <div className="container flex mx-auto justify-between items-center">
        {/* Logo and Title */}
        <Link to="/feed">
          <div className="flex items-center space-x-2">
            <img src={"/logo/logo_2.png"} className="h-14 w-14 mt-[-2px] mr-[-9px]" alt="logo" />
            <h1 className="text-3xl font-bold font-mulish text-gradient-2">Musify</h1>
          </div>
        </Link>

        {/* Right-side elements */}
   
          {/* Nav Links and Search Bar */}
          <div className="flex items-center space-x-4">
            <ul className="flex items-center space-x-4">
              <NavLink
                to="/feed"
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-3 py-1 rounded-full font-semibold transition ${
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                <FaHome className="text-sm" />
                <span className="text-sm">Feed</span>
              </NavLink>

              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-3 py-1 rounded-full font-semibold transition ${
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                <FaCompass className="text-sm" />
                <span className="text-sm">Explore</span>
              </NavLink>

              <NavLink
                to="/library"
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-3 py-1 rounded-full font-semibold transition ${
                    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                <FaStar className="text-sm" />
                <span className="text-sm">Library</span>
              </NavLink>
            </ul>

            {/* Search Bar */}
            <div className="relative flex items-center ">
              <FaSearch className="absolute ml-2 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="pl-8 pr-4 py-1 rounded-full border border-gray-300 w-96 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>

          {/* Notification, Chat, Profile, and Create Button */}
          <div className="flex items-center space-x-9">
            <FaBell className="text-gray-700 hover:text-black cursor-pointer text-xl" />
            <FaCommentDots className="text-gray-700 hover:text-black cursor-pointer text-xl" />

            {/* Profile Button */}
            <Link to={"/profile"}>
            <button className="flex items-center justify-center bg-gray-300 rounded-full p-2 hover:bg-gray-400 transition duration-200">
              <FaUser className="text-gray-600 text-xl" />
            </button>
            </Link>


            {/* Create Button */}
            <Link to={"/create"}>
              <button className="flex items-center space-x-2 bg-black text-white font-semibold px-4 py-[8px] rounded-full transition duration-200 hover:bg-gray-800">
                <FaPlus className="text-sm" />
                <span className="text-sm font-bold">Create</span>
              </button>
            </Link>
          </div>
        </div>
    </header>
  );
}

export default UserHeader;
