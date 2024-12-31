// ConfirmationModal.jsx
import React from 'react';

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  currentEmail, 
  newEmail, 
  onConfirm,
  isSubmitting 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold mb-4">Verify Email Change</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Current Email:</p>
          <p className="font-medium">{currentEmail}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">New Email:</p>
          <p className="font-medium">{newEmail}</p>
        </div>

        <form onSubmit={onConfirm} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Enter OTP sent to your current email
            </label>
            <input
              type="text"
              name="otp"
              className="w-full p-2 border rounded"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Confirm Email Change'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConfirmationModal;