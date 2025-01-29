
import React from 'react';
import axiosInstance from '../../../../axios/authInterceptor';
import toast from 'react-hot-toast';

function BlockConfirmationModal({ userId, username, isOpen, onClose, onBlockConfirm, shouldClose }) {
    const handleBlockUser = async () => {
        try {
            await axiosInstance.post(`/auth/block-user/`, {
                 user_id: userId,
                 action:'block' });

            onBlockConfirm();  
            onClose();
            shouldClose();
            toast.success('User successfully blocked')  
        } catch (error) {
            
            toast.error('Error blocking user');

            // console.error('Error blocking user:', error);
        }
    };


    if (!isOpen) return null; 

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-1/4 p-6 rounded-lg shadow-lg"> {/* Reduced width */}
                <h2 className="text-xl font-semibold mb-4 text-center"> {/* Center-aligned heading */}
                    Block {username}?
                </h2>
                <p className="text-gray-700 mb-6 text-center">
                    They won't be able to see your profile, posts, or interact with you. They won't be notified that they've been blocked.
                </p>
                <div className="flex justify-center space-x-4"> {/* Centered buttons with space */}
                    <button
                        onClick={handleBlockUser}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Block
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
    
}

export default BlockConfirmationModal;
