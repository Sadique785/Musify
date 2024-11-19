import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-9xl font-bold">404</h1>
      <p className="text-2xl mt-4">Oops! Page not found</p>
      <p className="mt-2 text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/admin')}
        className="mt-8 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
      >
        Go to Admin Dashboard
      </button>
    </div>
  );
}

export default NotFound;
