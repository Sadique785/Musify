import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaPlus, FaHome,FaBars, FaTimes, FaSearch, FaCompass, FaStar, FaBell, FaCommentDots, FaUser, FaCog, FaSignOutAlt, FaSpinner } from "react-icons/fa";
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
import { getBackendUrl } from "../../../services/config";


function UserHeader() {
  const { profile } = useContext(ProfileContext);
  const { isLoading } = useLoading();
  const username = profile.username;
  const backendUrl = getBackendUrl();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
        
        dispatch(logout());
  
        try {
          dispatch(resetTracks());
        } catch (err) {
          console.error("Error resetting tracks: ", err);
        }
  
        try {
          await clearIndexedDB();
        } catch (err) {
          console.error("Error clearing IndexedDB: ", err);
        }
  
        try {
          dispatch(resetSelectedContent());
          dispatch(resetSelectedSettings());
        } catch (err) {
          console.error("Error resetting selected content or settings: ", err);
        }
  
        try {
          await persistor.purge();
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
    <>
      <header className="bg-white fixed w-full transition duration-200 p-2 z-50 shadow-md">
        <div className="container flex mx-auto justify-between items-center">
          {/* Logo and Title */}
          <Link to="/feed">
            <div className="flex items-center space-x-2">
              <img src={"/logo/logo_2.png"} className="h-14 w-14 mt-[-2px] mr-[-9px]" alt="logo" />
              <h1 className="text-3xl font-bold font-mulish text-gradient-2">Musify</h1>
            </div>
          </Link>

          {/* Existing desktop navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Your existing navigation links */}
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

          {/* Desktop Right Side Icons */}
          <div className="hidden lg:flex items-center space-x-9">
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
                                src={`${profile.imageUrl}`}
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
                                        src={`${profile.imageUrl}`}
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
                        <Link to={'/edit'} >
                          <button className="flex items-center space-x-2 bg-black text-white font-semibold px-4 py-[8px] rounded-full transition duration-200 hover:bg-gray-800"
                          >
                            <FaPlus className="text-sm" />
                            <span className="text-sm font-bold">Create</span>
                          </button>
                        </Link>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu} 
              className="text-2xl text-gray-700 hover:text-black"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
        {isLoading && <div className="heading-loading-bar"></div>}

      </header>

      {/* Mobile Slide-out Menu */}
      <div 
      className={`
        fixed top-0 mt-20 right-0 h-full w-64 bg-white shadow-lg 
        transform transition-transform duration-300 ease-in-out 
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        z-40 overflow-y-auto
      `}
    >
<div className="p-4 space-y-4">
  {/* Search Bar */}
  <div className="w-full">
            <div className="max-w-[calc(100%-16px)]"> {/* Subtracting padding */}
              <SearchBar 
                onUserSelect={handleUserSelect}
                className="w-full max-w-full" // Add these classes to SearchBar component
                containerClassName="!w-full" // Add this if SearchBar has a container
                dropdownClassName="left-0 w-full md:w-64 -translate-x-full md:left-auto md:right-0 md:translate-x-0" // Position dropdowns to the left on mobile
              />
            </div>
          </div>

  {/* Mobile Navigation Items */}
  <div className="space-y-4">
    {/* Notifications */}
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
      onClick={() => {
        toggleNotifications();
        setMobileMenuOpen(false);
      }}
    >
      <FaBell className="text-xl" />
      <span>Notifications</span>
    </div>

    {/* Chat */}
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
      onClick={() => {
        handleChatNavigate();
        setMobileMenuOpen(false);
      }}
    >
      <FaCommentDots className="text-xl" />
      <span>Chat</span>
    </div>

    {/* Create */}
    <Link 
      to="/edit"
      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
      onClick={() => setMobileMenuOpen(false)}
    >
      <FaPlus className="text-xl" />
      <span>Create</span>
    </Link>

    {/* Profile */}
    <Link 
      to={`/profile/${username}`}
      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
      onClick={() => setMobileMenuOpen(false)}
    >
      {profile.imageUrl ? (
        <img
          src={`${profile.imageUrl}`}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <FaUser className="text-xl" />
      )}
      <span>{username}</span>
    </Link>

    {/* Settings */}
    <Link 
      to="/settings"
      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
      onClick={() => setMobileMenuOpen(false)}
    >
      <FaCog className="text-xl" />
      <span>Settings</span>
    </Link>

    {/* Logout */}
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
      onClick={handleLogout}
    >
      <FaSignOutAlt className="text-xl" />
      <span>Logout</span>
    </div>
  </div>
</div>
      </div>
      <PostModalProvider>
      <NotificationComponent 
        userId={profile.userId} 
        isOpen={notificationOpen} 
        onClose={() => {
          setNotificationOpen(false);
          setMobileMenuOpen(false); // Close mobile menu if open
        }} 
        className="md:left-auto md:right-0 left-0 -translate-x-full md:translate-x-0" // Add positioning classes

      />
    </PostModalProvider>


    {/* Create Dropdown */}
    <CreateDropdown 
      isOpen={createDropdownOpen} 
      onClose={() => {
        setCreateDropdownOpen(false);
        setMobileMenuOpen(false); // Close mobile menu if open
      }} 
      className="md:left-auto md:right-0 left-0 -translate-x-full md:translate-x-0" // Add positioning classes

    />
    </>
  );

}

export default UserHeader;
