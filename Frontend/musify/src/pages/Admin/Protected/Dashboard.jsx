import React from "react";
import AdminSidebar from '../../../components/Admin/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import UserGrowthChart from './InnerComponents/UserGrowthChart';
import ContentDistributionChart from './InnerComponents/ContentDistributionChart';
import UserEngagementChart from './InnerComponents/UserEngagementChart';

function Dashboard() {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-col w-full bg-[#060E0E] text-white relative">
        <AdminHeader />
        <div className="flex-grow py-12 px-24 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-2">
              <UserGrowthChart />
            </div>
            <div>
              <ContentDistributionChart />
            </div>
            <div>
              <UserEngagementChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;