import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import SettingsLeft from '../../components/Public/Settings/SettingsLeft';
import SettingsRight from '../../components/Public/Settings/SettingsRight';

function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative">
      {/* Mobile Menu Button - Now moves with sidebar */}
      <button 
        onClick={toggleSidebar}
        className={`
          fixed top-20 z-50 md:hidden 
           p-2 rounded-lg 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'left-[210px]' : 'left-0'}
        `}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-8 w-8 text-gray-600" />
        ) : (
          <ChevronRight className="h-8 w-8 text-gray-600" />
        )}
      </button>

      <div className="flex">
        <div className={`
          fixed md:relative
          md:w-1/4
          md:block
          z-40
          w-64
          p-4
          bg-white
          md:sticky
          md:top-20
          h-[calc(100vh-0rem)]
          mt-[60px]
          sm:mt-[50px]
          md:mt-[100px]
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <SettingsLeft setIsSidebarOpen={setIsSidebarOpen} />
        </div>

        {/* Settings Right */}
        <div className="w-full md:w-3/4 p-4 feed-container overflow-y-auto h-[calc(100vh-8rem)]">
          <SettingsRight />
        </div>

        {/* Mobile Overlay with fade transition */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black transition-opacity duration-300 ease-in-out
              opacity-30 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
}

export default Settings;