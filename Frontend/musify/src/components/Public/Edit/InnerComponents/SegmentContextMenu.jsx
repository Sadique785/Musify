// SegmentContextMenu.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SegmentContextMenu = ({ 
  isOpen, 
  position, 
  onClose, 
  onDelete,
  segment 
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.userSelect = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate menu position to keep it within viewport bounds
  const adjustMenuPosition = () => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const menuWidth = 200; // Approximate menu width
    const menuHeight = 40; // Approximate menu height

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position if menu would overflow viewport
    if (x + menuWidth > viewport.width) {
      x = viewport.width - menuWidth;
    }

    // Adjust vertical position if menu would overflow viewport
    if (y + menuHeight > viewport.height) {
      y = viewport.height - menuHeight;
    }

    return { x, y };
  };

  const adjustedPosition = adjustMenuPosition();

  return createPortal(
    <div
      ref={menuRef}
      className="fixed rounded-lg shadow-lg py-1"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        backgroundColor: '#2e2e2e',
        border: '1px solid #444',
        zIndex: 99999, // Extremely high z-index to ensure it's above everything
        minWidth: '160px'
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors duration-150"
        style={{
          color: '#f87171',
        }}
      >
        <X size={16} />
        <span className="text-gray-200">Delete Segment</span>
      </button>
    </div>,
    document.body
  );
};

export default SegmentContextMenu;