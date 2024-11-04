import { Route, Routes, Navigate } from "react-router-dom";
import AdminWrapper from "../Wrappers/AdminWrapper";
import AdminDashboard from "../pages/Admin/Protected/Dashboard";
import AdminLogin from "../pages/Admin/AdminLogin";
import UserManagement from "../pages/Admin/Protected/ManageUsers";
import NotFound from "../components/Public/NotFound";
import { Toaster } from 'react-hot-toast';
import AdminDetail from "../pages/Admin/Protected/AdminDetail";
import ManageContent from "../pages/Admin/Protected/ManageContent";
import { AdminProfileContext } from "../context/AdminProfileContext";
import { AdminProfileProvider } from "../context/AdminProfileContext";




function AdminRoutes() {
  return (
    <>
    <Toaster />
    <Routes>

        <Route path="/" element={<Navigate to="/admin/login" />} />


      {/* Admin Login Route */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route element={
        <AdminProfileProvider > 
        <AdminWrapper />
        </AdminProfileProvider>
        
        }> {/* Correct closing tag */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/content" element={<ManageContent />} />
        <Route path="/users/details/:id" element={<AdminDetail />} />

      </Route>


      <Route path="*" element={<NotFound />} /> {/* Wildcard route for 404 */}
    </Routes>
    </>
  );
}

export default AdminRoutes;
