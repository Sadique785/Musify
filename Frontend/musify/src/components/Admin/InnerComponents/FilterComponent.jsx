import React, { useState, useRef, useEffect } from 'react';

function FilterComponent({ onFilterSelect, selectedFilter, setSelectedFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    onFilterSelect(filter); 
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {        
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); 
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {        
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); 

  return (
    <div className="relative ml-4 inline-flex items-center">
      <span className="text-gray-600 mr-2">Filter by :</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
          style={{ width: '150px' }} 
        >
          <span className="flex-grow text-left">{selectedFilter}</span>
          <span className="ml-2">▼</span> 
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-full bg-gray-900 text-white rounded shadow-lg transition-all duration-300 z-10"
          >
            {['All', 'Active', 'Inactive', 'Admin', 'User'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className="block px-4 py-2 text-left w-full hover:bg-gray-700"
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterComponent;
