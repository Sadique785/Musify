// UserLoader.js
import React from 'react';

function UserLoader() {
  return (
    <div className="animate-pulse">
      {/* Skeleton for the three sections */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="text-center border-r border-gray-600 pr-6">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-600 rounded mt-2"></div>
        </div>
        <div className="text-center border-r border-gray-600 pr-6">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-600 rounded mt-2"></div>
        </div>
        <div className="text-center">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-600 rounded mt-2"></div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex mb-6">
        <div className="bg-gray-700 text-white p-2 flex-grow rounded-l-md border border-gray-600">
          <div className="h-4 bg-gray-600 rounded"></div>
        </div>
        <div className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-r-md h-10"></div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 table-auto">
          <thead>
            <tr className="text-left border-b border-gray-600">
              <th className="py-3 px-6">User</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Phone</th>
              <th className="py-3 px-6">Role</th>
              <th className="py-3 px-6">Is Admin</th>
              <th className="py-3 px-6">Last Logged In</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => ( // Display 5 skeleton rows
              <tr key={index} className="border-b border-gray-700">
                <td className="py-3 px-6 flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full mr-3"></div>
                  <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserLoader;
