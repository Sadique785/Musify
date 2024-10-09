import React from "react";
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';

function Dashboard() {


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col w-full bg-[#060E0E] text-white relative">
        {/* Header */}
        <AdminHeader />

        {/* Right Content */}
        <div className="flex-grow p-8">
          <h1 className="text-3xl font-bold mb-6">Welcome to the Admin Dashboard</h1>
          <p>Here you can manage users, content, and view analytics.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
