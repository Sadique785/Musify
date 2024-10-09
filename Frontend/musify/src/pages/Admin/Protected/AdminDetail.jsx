import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../../../components/Admin/AdminHeader';
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import axiosInstance from '../../../axios/adminInterceptor';
import UserLeft from '../../../components/Admin/UserLeft';  // Import UserLeft
import UserRight from '../../../components/Admin/UserRight';  // Import UserRight
import { toast } from 'react-hot-toast'; 


function AdminDetail() {
  const { id } = useParams(); // Access the dynamic ID
  const [adminProfileImage, setAdminProfileImage] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/admin-side/fetch-user-details/${id}/`);
        
        if (response.data && response.data.admin_profile_image) {
          setAdminProfileImage(response.data.admin_profile_image);
        }

        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to fetch user details.');
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchData(); 
  }, [id]);

  // Handle loading and error
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleBlockUser = async () => {
    try {
      const newStatus = !userData.is_active; 
      await axiosInstance.post(`/admin-side/admin-block-user/${userData.id}/`, {}, {
        headers: { 'Content-Type': 'application/json' },
      });
      setUserData((prevData) => ({ ...prevData, is_active: newStatus }));
      toast.success(newStatus ? 'User has been unblocked!' : 'User has been blocked!');
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error('Failed to update user status.');
    }
  };

  // Function to make the user an admin
  const handleMakeAdmin = async () => {
    try {
      const newStatus = !userData.is_staff;
      await axiosInstance.post(`/admin-side/make-admin/${id}/`, {}, { 
        headers: {
          'Content-Type': 'application/json',  // Ensure correct Content-Type
        }
      });
      setUserData((prevData) => ({ ...prevData, is_staff: newStatus }));
      const successMessage = newStatus ? 'User has been made an admin successfully!' : 'Admin status has been revoked successfully!';

      toast.success(successMessage);
    } catch (error) {
    const errorMessage = userData.is_staff ? 'Failed to revoke admin status.' : 'Failed to make the user an admin.';

      console.error(errorMessage);
      toast.error(errorMessage);
    }
  };
  

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-grow bg-[#060E0E] text-white flex flex-col">
        <AdminHeader adminProfileImage={adminProfileImage} />

        <div className="flex flex-col md:flex-row p-4">
          {/* Pass data to UserLeft component */}
          <UserLeft userData={userData} />
          
          {/* Pass data and functions to UserRight component */}
          <UserRight 
            userData={userData} 
            handleBlockUser={handleBlockUser}
            handleMakeAdmin={handleMakeAdmin}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDetail;
