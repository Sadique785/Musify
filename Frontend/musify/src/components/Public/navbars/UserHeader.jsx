import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaPlus, FaHome, FaSearch, FaCompass, FaStar, FaBell, FaCommentDots, FaUser, FaCog, FaSignOutAlt, FaSpinner } from "react-icons/fa";
import { ProfileContext } from "../../../context/ProfileContext";
import { useLoading } from "../../../context/LoadingContext";
import { useDispatch } from "react-redux";
import axiosInstance from "../../../axios/authInterceptor";
import { persistor } from "../../../redux/auth/userStore";
import { logout } from "../../../redux/auth/Slices/authSlice";
import { clearIndexedDB } from "../../../indexedDb/indexedDb";
import { resetTracks } from "../../../redux/auth/Slices/audioSlice";
import { resetSelectedContent } from "../../../redux/auth/Slices/contentSlice";
import { resetSelectedSettings } from "../../../redux/auth/Slices/settingsSlice";
import CreateDropdown from "../Feed/InnerComponents/CreateDropdown";
import SearchBar from "./InnerComp.jsx/SearchBar";
import NotificationComponent from "./InnerComp.jsx/Notification/NotificationComponent";
import { PostModalProvider } from "../../../context/PostModalContext";


function UserHeader() {
  const { profile } = useContext(ProfileContext);
  const { isLoading } = useLoading();
  const username = profile.username;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserLogout = async () => {
    try {
      const response = await axiosInstance.post("/auth/logout/");
      if (response.status === 200) {
        console.log("Logout successful");
        
        dispatch(logout());
  
        try {
          dispatch(resetTracks());
          console.log("Tracks Resetted");
        } catch (err) {
          console.error("Error resetting tracks: ", err);
        }
  
        try {
          await clearIndexedDB();
          console.log("IndexedDB cleared");
        } catch (err) {
          console.error("Error clearing IndexedDB: ", err);
        }
  
        try {
          dispatch(resetSelectedContent());
          dispatch(resetSelectedSettings());
          console.log("Selected content and settings reset");
        } catch (err) {
          console.error("Error resetting selected content or settings: ", err);
        }
  
        try {
          await persistor.purge();
          console.log("Persistor cleared");
        } catch (err) {
          console.error("Error purging persistor: ", err);
        }
  
        navigate("/login");
        window.location.reload()
      } else {
        console.error("Logout failed", response.data);
      }
    } catch (error) {
      console.error("An error occurred during logout: ", error);
    }
  };

  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
  };

  const handleChatNavigate = () =>{
    navigate('/chat');
  }
  

  const handleLogout = async () => {
    setLogoutLoading(true);
    await handleUserLogout();
    setLogoutLoading(false);
    setDropdownOpen(false);
  };


  const handleUserSelect = (user) => {
    navigate(`/profile/${user.username}`);
  };

  const toggleCreateDropdown = () => setCreateDropdownOpen(!createDropdownOpen);


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
        <div className="flex items-center space-x-4">
          {/* Nav Links for Feed, Explore, Library */}
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

            {/* <NavLink
              to="/explore"
              className={({ isActive }) =>
                `flex items-center space-x-1 px-3 py-1 rounded-full font-semibold transition ${
                  isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              <FaCompass className="text-sm" />
              <span className="text-sm">Explore</span>
            </NavLink> */}

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

          <div className="ml-24 relative">
          <SearchBar onUserSelect={handleUserSelect} />
        </div>
        </div>

        {/* Notification, Chat, Profile Dropdown */}
        <div className="flex items-center space-x-9">
          <FaBell 
          className="text-gray-700 hover:text-black cursor-pointer text-xl" 
          onClick={toggleNotifications}
          />
          <FaCommentDots className="text-gray-700 hover:text-black cursor-pointer text-xl" 
          onClick={handleChatNavigate}
          />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center justify-center bg-gray-300 rounded-full hover:bg-gray-400 transition duration-200"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {profile.imageUrl ? (
                <img
                  src={`${backendUrl}${profile.imageUrl}`}
                  alt="Profile Preview"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-600 text-xl" />
                </div>
              )}
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 p-2 bg-white shadow-lg border border-gray-200 rounded-lg mt-6 w-52"
                style={{ zIndex: 10 }}
              >
                <Link to={`/profile/${username}`}>
                  <div
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4">
                      {profile.imageUrl ? (
                        <img
                          src={`${backendUrl}${profile.imageUrl}`}
                          alt="Profile Preview"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-gray-600 text-xl" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold">{username}</span>
                      <div className="text-sm text-gray-500">View Profile</div>
                    </div>
                  </div>
                </Link>

                <div className="border-t border-gray-200"></div>

                <Link to="/settings">
                  <div
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className="text-gray-600 text-xl mr-2" />
                    <span>Settings</span>
                  </div>
                </Link>
                <div
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown from closing
                    handleLogout(); // Trigger logout logic
                  }}
                >
                  <FaSignOutAlt className="text-gray-600 text-xl mr-2" />
                  {logoutLoading ? (
                    <div className="flex items-center">
                      Logging out <FaSpinner className="animate-spin ml-2" />
                    </div>
                  ) : (
                    <span>Logout</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Create Button */}
          <Link >
            <button className="flex items-center space-x-2 bg-black text-white font-semibold px-4 py-[8px] rounded-full transition duration-200 hover:bg-gray-800"
            onClick={(e) => {
              e.preventDefault();
              toggleCreateDropdown();
            }}>
              <FaPlus className="text-sm" />
              <span className="text-sm font-bold">Create</span>
            </button>
          </Link>
        </div>
      </div>

            <PostModalProvider>
            <NotificationComponent 
        userId={profile.userId} 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
      />
            </PostModalProvider>

      {/* Loading bar */}
      {isLoading && <div className="heading-loading-bar"></div>}
      <CreateDropdown isOpen={createDropdownOpen} onClose={() => setCreateDropdownOpen(false)} />

    </header>
  );
}

export default UserHeader;
