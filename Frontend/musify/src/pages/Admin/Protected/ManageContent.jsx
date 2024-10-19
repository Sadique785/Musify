import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import axiosInstance from '../../../axios/adminInterceptor';

function ManageContent() {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [error, setError] = useState(null);

  // Fetch reported posts data
  useEffect(() => {
    const fetchReportedPosts = async () => {
      try {
        const response = await axiosInstance.get('/content/reported/');
        const data = response.data;
        setReportedPosts(data.reported_posts || []); // Set reported posts data or empty array
      } catch (error) {
        console.error('Error fetching reported posts:', error);
        setError('Failed to fetch reported posts.'); // Set error message
      }
    };

    fetchReportedPosts();
  }, []);

  // Action to block a reported post
  const blockPost = async (reportId) => {
    try {
      await axiosInstance.post(`/content/block-post/${reportId}/`);
      // Remove the blocked post from the list
      setReportedPosts((prevPosts) => prevPosts.filter(post => post.report_id !== reportId));
      alert('Post blocked successfully.');
    } catch (error) {
      console.error('Error blocking post:', error);
      alert('Failed to block the post.');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      <div className="flex-grow bg-[#060E0E] text-white flex flex-col">
        {/* Admin Header */}
        <AdminHeader />

        {/* Main Content */}
        <div className="flex-grow p-10 relative overflow-y-auto">
          {/* Heading */}
          <h2 className="text-2xl font-bold mb-6">Reported Posts</h2>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 table-auto">
              <thead>
                <tr className="text-left border-b border-gray-600">
                  <th className="py-3 px-6">Content</th>
                  <th className="py-3 px-6">Username</th>
                  <th className="py-3 px-6">Post Type</th>
                  <th className="py-3 px-6">Report ID</th>
                  <th className="py-3 px-6">Reported By</th>
                  <th className="py-3 px-6">Reason</th>
                  <th className="py-3 px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {reportedPosts.length > 0 ? (
                  reportedPosts.map((post, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-3 px-6">
                        <img
                          src={post.image || '/path-to-placeholder-image.jpg'}
                          alt="Post Content"
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-3 px-6">{post.username}</td>
                      <td className="py-3 px-6">{post.post_type}</td>
                      <td className="py-3 px-6">{post.report_id}</td>
                      <td className="py-3 px-6">{post.reported_by}</td>
                      <td className="py-3 px-6">{post.reason}</td>
                      <td className="py-3 px-6">
                        <button
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => blockPost(post.report_id)}
                        >
                          Block
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-3">No reported posts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Error Message */}
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default ManageContent;
