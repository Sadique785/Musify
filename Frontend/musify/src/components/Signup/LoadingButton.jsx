import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingButton = ({ 
    type = "submit",
    loading = false,
    loadingText, // New prop for custom loading text
    onClick,
    className = "",
    children
  }) => {
    // Function to generate loading text if not provided
    const getLoadingText = () => {
      if (loadingText) return loadingText;
      if (typeof children === 'string') {
        // Handle common cases
        if (children.toLowerCase() === 'login') return 'Logging in';
        if (children.toLowerCase() === 'signup') return 'Signing up';
        if (children.toLowerCase() === 'submit') return 'Submitting';
        if (children.toLowerCase() === 'verify otp') return 'Verifying';
        // For other cases, add 'ing'
        return children.replace(/e?$/, 'ing');
      }
      return 'Loading'; // fallback
    };
  
    return (
      <button
        type={type}
        disabled={loading}
        onClick={onClick}
        className={`
          w-full h-[40px] sm:h-[45px] 
          rounded-full transition 
          text-sm sm:text-base
          ${loading ? 'bg-gray-500 cursor-not-allowed text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}
          ${className}
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            {getLoadingText()}
            <FaSpinner className="animate-spin ml-2 h-4 w-4" />
          </div>
        ) : children}
      </button>
    );
  };
  
  export default LoadingButton;