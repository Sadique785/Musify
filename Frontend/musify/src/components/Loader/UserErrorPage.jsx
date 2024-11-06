import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../Public/navbars/UserHeader';

function UserErrorPage() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/feed'); // Navigate to the feed page
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* You can add your UserHeader here if you want */}

      <div className="error-content text-center bg-white p-8 rounded-lg shadow-lg w-96 mt-8">
        <h2 className="text-3xl font-semibold text-gray-800">The page you're looking for is not available.</h2>
        <p className="mt-4 text-gray-600">It might be a broken link or the page may have been moved.</p>

        <button
          onClick={handleRedirect}
          className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default UserErrorPage;
