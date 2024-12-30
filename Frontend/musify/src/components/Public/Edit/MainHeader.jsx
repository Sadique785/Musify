import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import EditDropdown from './InnerComponents/EditDropdown';
import SaveButtons from './InnerComponents/SaveButtons';


function MainHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/feed');
  }


  const handleDropdownToggle = () => {
    setIsDropdownOpen(prevState => !prevState);
  };

  return (
<header className="fixed top-0 left-0 w-full h-[60px] bg-[#060505] flex items-center justify-between px-4 z-[60]">    {/* Left Section - EditDropdown and Musify Icon/Text */}
      <div className="flex  items-center w-1/5 gap-2">
        {/* Dropdown Icon and Toggle */}
        <div className="relative">
          <button onClick={handleDropdownToggle} className="p-2 ">
            <span className="text-white text-4xl">≡</span> {/* 3 horizontal lines */}
          </button>
          {/* EditDropdown component shown below the icon */}
          {isDropdownOpen && <EditDropdown />}
        </div>


        <div className='flex items-center gap-1 mt-1 ml-[-15px] cursor-pointer' onClick={handleHomeClick} >
        <img src={'/logo/logo_2.png'} alt="Musify Icon" className="w-10 h-10" />
        <span className="text-white font-semibold ml-[-10px] text-xl">Musify</span>
        </div>
      </div>

      {/* Middle Section - Centered New Project Text */}
      <div className="w-3/5 flex justify-center ">
        <h1 className="text-white font-mulish text-md">New Project</h1>
      </div>

      {/* Right Section - SaveButtons */}
      <div className="w-1/5 flex justify-end">
        <SaveButtons />
      </div>
    </header>
  );
}

export default MainHeader;
