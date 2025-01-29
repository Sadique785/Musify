import React from "react";
import { FaMusic, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function ProjectModal({ isOpen, onClose, modalRef }) {
    // Move useNavigate to the top level
    const navigate = useNavigate();
  
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    const handleNewProject = (e) => {
        e.preventDefault();

        navigate('/edit');
    }


    return (
        <div ref={modalRef} className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-[350px] p-6">
                <h2 className="text-lg font-bold text-gray-800 text-center mb-4">Create a Project</h2>

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNewProject(e);
                    }}
                    className="flex items-center py-3 gap-4 hover:bg-gray-100 rounded-lg transition duration-200 ease-in-out cursor-pointer"
                    >
                    <div className="w-1/4">
                        <div className="w-12 h-12 flex justify-center items-center rounded-lg bg-gray-200 p-2">
                        <FaUpload className="text-gray-600 text-xl" />
                        </div>
                    </div>
                    <div className="w-3/4">
                        <p className="text-md font-bold text-gray-800">Upload your own Karaoke</p>
                        <p className="text-xs text-gray-500">Use Karaoke from your device</p>
                    </div>
                    </div>


                <div className="flex items-center py-3 gap-4 hover:bg-gray-100 rounded-lg transition duration-200 ease-in-out cursor-pointer">
                    <div className="w-1/4">
                        <div className="w-12 h-12 flex justify-center items-center rounded-lg bg-blue-200 p-2">
                            <FaMusic className="text-blue-600 text-xl" />
                        </div>
                    </div>
                    <div className="w-3/4">
                        <p className="text-md font-bold text-gray-800">Use existing Karaoke</p>
                        <p className="text-xs text-gray-500">Use the Karaokes provided by Musify</p>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="mt-4 text-center w-full text-sm text-blue-500 font-semibold"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default ProjectModal;
