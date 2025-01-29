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
          <div className="hidden md:flex items-center space-x-4">
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
          <div className="hidden md:flex items-center space-x-9">
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

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu} 
              className="text-2xl text-gray-700 hover:text-black"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-3/4 md:w-1/2 bg-white shadow-lg 
          transform transition-transform duration-300 ease-in-out 
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          z-40 overflow-y-auto
        `}
      >
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="mb-4">
            <SearchBar onUserSelect={handleUserSelect} />
          </div>

          {/* Mobile Navigation Items */}
          <div className="space-y-4">
            {/* Notifications */}
            <div 
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
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
            <div 
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
              onClick={() => {
                toggleCreateDropdown();
                setMobileMenuOpen(false);
              }}
            >
              <FaPlus className="text-xl" />
              <span>Create</span>
            </div>

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
    </>
  );