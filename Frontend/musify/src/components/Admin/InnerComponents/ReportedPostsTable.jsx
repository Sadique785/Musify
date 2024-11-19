import React from 'react';
import { X } from 'lucide-react'; // for any icons if needed

function ReportedPostsTable({ 
  reportedPosts, 
  handleReasonClick, 
  handlePreviewClick, 
  blockPost ,
  toggleReviewedStatus 
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg bg-gray-800 table-auto">
      <thead>
          <tr className="text-left border-b border-gray-600">
            <th className="py-3 px-6">Content</th>
            <th className="py-3 px-6">Username</th>
            <th className="py-3 px-6">Post Type</th>
            <th className="py-3 px-6">Reported By</th>
            <th className="py-3 px-6">Reason</th>
            <th className="py-3 px-6">Reviewed</th>
            <th className="py-3 px-6">Action</th>
          </tr>
        </thead>
        <tbody>
          {reportedPosts.length > 0 ? (
            reportedPosts.map((post) => (
              <tr key={post.report_id} className="border-b border-gray-700">
                <td className="py-3 px-6">
                  {post.post_type === 'image' ? (
                    <img
                      src={post.file_url}
                      alt="Post Content"
                      className="w-16 h-16 object-cover rounded cursor-pointer transform transition duration-200 hover:scale-105 hover:opacity-90"
                      onClick={() => handlePreviewClick(post.file_url, post.post_type)}
                    />
                  ) : post.post_type === 'audio' ? (
                    <div
                      className="w-16 h-16 bg-gray-600 flex items-center justify-center rounded cursor-pointer transform transition duration-200 hover:scale-105 hover:opacity-90"
                      onClick={() => handlePreviewClick(post.file_url, post.post_type)}
                    >
                      <img
                        src="/cover/cov1.jpg"
                        className="h-16 w-16 object-cover rounded cursor-pointer"
                        alt=""
                      />
                    </div>
                  ) : post.post_type === 'video' ? (
                    <div
                      className="w-16 h-16 bg-gray-600 flex items-center justify-center rounded cursor-pointer transform transition duration-200 hover:scale-105 hover:opacity-90"
                      onClick={() => handlePreviewClick(post.file_url, post.post_type)}
                    >
                      <img
                        src="/cover/editing.jpeg"
                        className="h-16 w-16 object-cover rounded cursor-pointer"
                        alt=""
                      />
                    </div>
                  ) : (
                    <div
                      className="w-16 h-16 bg-gray-600 flex items-center justify-center rounded cursor-pointer transform transition duration-200 hover:scale-105 hover:opacity-90"
                      onClick={() => handlePreviewClick(post.file_url, post.post_type)}
                    >
                      <i className="text-white">📄</i> {/* Icon for other files */}
                    </div>
                  )}
                </td>
                <td className="py-3 px-6">{post.username}</td>
                <td className="py-3 px-6">{post.post_type}</td>
                <td className="py-3 px-6">{post.reported_by}</td>
                <td className="py-3 px-6">
                  <button
                    onClick={() => handleReasonClick(post)}
                    className="text-blue-400 hover:text-blue-300 underline focus:outline-none"
                  >
                    {post.report_reason}
                  </button>
                </td>

                <td className="py-3 px-6">
                  <input
                    type="checkbox"
                    checked={post.is_reviewed}
                    onChange={() => toggleReviewedStatus(post.report_id, !post.is_reviewed)}
                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 focus:ring-2 cursor-pointer"
                  />
                </td>
                <td className="py-3 px-6">
                  <button
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition-colors duration-200"
                    onClick={() => blockPost(post.post_id, !post.post_status)}  // Pass new status to toggle
                    >
                    {post.post_status ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-3">
                No reported posts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReportedPostsTable;
