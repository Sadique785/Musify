import React from "react";
import AdminSidebar from '../../../components/Admin/AdminSidebar';


function Dashboard() {
    return (
        <div className="flex h-screen">
          {/* Sidebar */}
          <AdminSidebar />
    
          {/* Right Content */}
          <div className="w-3/4 bg-[#060E0E] text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome to the Admin Dashboard</h1>
            <p>Here you can manage users, content, and view analytics.</p>
          </div>
        </div>
      );
}


export default Dashboard;