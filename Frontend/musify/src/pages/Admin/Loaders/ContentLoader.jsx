import React from 'react';

const ContentLoader = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 table-auto animate-pulse">
        <thead>
          <tr className="text-left border-b border-gray-600">
            <th className="py-3 px-6">Content</th>
            <th className="py-3 px-6">Username</th>
            <th className="py-3 px-6">Post Type</th>
            <th className="py-3 px-6">Reported By</th>
            <th className="py-3 px-6">Reason</th>
            <th className="py-3 px-6">Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Simulate several rows with loading placeholders */}
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="py-3 px-6">
                <div className="bg-gray-700 w-16 h-16 rounded"></div>
              </td>
              <td className="py-3 px-6">
                <div className="bg-gray-700 h-4 rounded w-24"></div>
              </td>
              <td className="py-3 px-6">
                <div className="bg-gray-700 h-4 rounded w-16"></div>
              </td>
              <td className="py-3 px-6">
                <div className="bg-gray-700 h-4 rounded w-24"></div>
              </td>
              <td className="py-3 px-6">
                <div className="bg-gray-700 h-4 rounded w-32"></div>
              </td>
              <td className="py-3 px-6">
                <div className="bg-red-700 h-8 rounded w-20"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContentLoader;
