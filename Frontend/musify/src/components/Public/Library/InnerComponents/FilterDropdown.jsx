import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FilterDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'all', label: 'All' },
    { value: 'private', label: 'Private' },
    { value: 'public', label: 'Public' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 w-24 bg-white border rounded-lg hover:bg-gray-50 transition-colors font-mulish text-sm"
      >
        <span className='text-sm' >{options.find(opt => opt.value === selected)?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute mt-1 w-24 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden origin-top animate-in zoom-in-95 duration-100"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-1.5 text-left hover:bg-gray-50 transition-colors font-mulish text-sm"
            >
              <span>{option.label}</span>
              {selected === option.value && (
                <Check className="w-3.5 h-3.5 text-green-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;