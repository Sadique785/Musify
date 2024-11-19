import React, { useEffect, useRef, useState } from "react";
import { FaMusic, FaVideo, FaUpload } from "react-icons/fa";
import ProjectModal from "./ProjectModal";


function CreateDropdown({ isOpen, onClose }){
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);


  // Reset states when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setShowModal(false);
    }
  }, [isOpen]);

  // Handle outside clicks for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        console.log("Outside click detected, closing dropdown and modal");
        onClose();
        setShowModal(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);



  const handleNewProjectClick = () => {
    console.log("New Project clicked in dropdown, opening modal");
    setShowModal(true);
};

const handleModalClose = () => {
    console.log("Modal close detected, closing modal and dropdown");
    setShowModal(false);
    onClose();
};


  if (!isOpen) return null;

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute mt-2 bg-white shadow-lg border border-gray-200 rounded-lg p-4 w-[300px] mr-2 h-auto z-40"
        style={{ top: '100%', right: 0 }}
      >
        <div
          onClick={handleNewProjectClick}
          className="flex items-center pl-3 py-3 gap-4 hover:bg-gray-100 rounded-lg transition duration-200 ease-in-out cursor-pointer"
        >
          <div className="w-1/4">
            <div className="w-14 h-14 border border-blue-300 flex justify-center items-center rounded-lg bg-blue-200 p-2">
              <FaMusic className="text-blue-600 text-2xl" />
            </div>
          </div>
          <div className="w-3/4">
            <p className="text-md text-gray-800 font-mulish font-bold">New Project</p>
            <p className="text-xs text-gray-500 font-mulish">Create an empty project</p>
          </div>
        </div>

        <div className="flex items-center py-3 pl-3 gap-4 hover:bg-gray-100 rounded-lg transition duration-200 ease-in-out cursor-pointer">
          <div className="w-1/4">
            <div className="w-14 h-14 border-green-300 flex border justify-center items-center rounded-lg bg-green-200 p-2">
              <FaVideo className="text-green-600 text-2xl" />
            </div>
          </div>
          <div className="w-3/4">
            <p className="text-md text-gray-800 font-mulish font-bold">New Work</p>
            <p className="text-xs text-gray-500 font-mulish">Create a video and audio project</p>
          </div>
        </div>
      </div>

      {/* Modal component */}
      <ProjectModal ref={modalRef} isOpen={showModal} onClose={handleModalClose} />
    </>
  );
}

export default CreateDropdown;