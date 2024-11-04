import React from 'react';

function FeedEmptyState({ title, description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-10">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default FeedEmptyState;
