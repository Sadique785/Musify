import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import { X } from 'lucide-react';
import axiosInstance from '../../../axios/adminInterceptor';
import FilePreviewModal from '../../../components/Admin/InnerComponents/FilePreviewModal';
import ContentLoader from '../Loaders/ContentLoader';
import ReportedPostsTable from '../../../components/Admin/InnerComponents/ReportedPostsTable';
import toast from 'react-hot-toast'

function ManageContent() {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchReportedPosts = async () => {
      try {
        const response = await axiosInstance.get('/content/reported/');
        const data = response.data.results;
        console.log('dataaaa', data);
        
        setReportedPosts(data);
      } catch (error) {
        setError('Failed to fetch reported posts.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportedPosts();
  }, []);





  const handleReasonClick = (post) => {
    setSelectedReport(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handlePreviewClick = (fileUrl, fileType) => {
    setSelectedFileUrl(fileUrl);
    setSelectedFileType(fileType);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setSelectedFileUrl(null);
    setSelectedFileType(null);
  };

  const toggleReviewedStatus = async (reportId, newStatus) => {
    setReportedPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.report_id === reportId ? { ...post, is_reviewed: newStatus } : post
      )
    );
  
    try {
      await axiosInstance.post('content/review-status/', {
        reportId: reportId,
        newStatus: newStatus,
      });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error("Failed to update status. Reverting changes.");
  
      setReportedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.report_id === reportId ? { ...post, is_reviewed: !newStatus } : post
        )
      );
    }
  };

  
  const blockPost = async (postId, newStatus) => {
    try {
      await axiosInstance.post(`/content/block-post/`, {
        post_id: postId,
        new_status: newStatus,
      });
  
      toast.success(`Post ${newStatus ? 'unblocked' : 'blocked'} successfully`);
  
      setReportedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId ? { ...post, post_status: newStatus } : post
        )
      );
    } catch (error) {
      toast.error(`Failed to ${newStatus ? 'block' : 'unblock'} the post.`);
    }
  };
  
  
  

  // Modal component
  const DescriptionModal = () => {
    if (!isModalOpen || !selectedReport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 relative">
          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="mt-2">
            <h3 className="text-xl font-semibold text-center text-white mb-4">
              {selectedReport.report_reason}
            </h3>
            <div className="text-gray-300 mt-4">
              {selectedReport.report_description ? (
                <p className="whitespace-pre-wrap">{selectedReport.report_description}</p>
              ) : (
                <p className="text-center text-gray-400">No description available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-grow bg-[#060E0E] text-white flex flex-col">
        <AdminHeader />
        <div className="flex-grow p-10 relative overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Reported Posts</h2>
          {isLoading ? (
            <ContentLoader />
          ) : (
            <ReportedPostsTable
              reportedPosts={reportedPosts}
              handleReasonClick={handleReasonClick}
              handlePreviewClick={handlePreviewClick}
              blockPost={blockPost}
              toggleReviewedStatus={toggleReviewedStatus}

            />
          )}
          {error && <div className="text-red-500 mt-4">{error}</div>}
          <DescriptionModal />
          {isPreviewModalOpen && (
            <FilePreviewModal
              fileUrl={selectedFileUrl}
              fileType={selectedFileType}
              onClose={closePreviewModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageContent;
