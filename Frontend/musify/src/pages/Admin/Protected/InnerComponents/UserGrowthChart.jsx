import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../../../axios/adminInterceptor';
import { UserGrowthChartShimmer } from './ChatShimmer';

const UserGrowthChart = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/admin-side/user-growth-data/');
        console.log('response', response)
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user growth data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <UserGrowthChartShimmer />;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-96">
      <h2 className="text-xl font-bold mb-4 text-white">User Growth Trends</h2>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={userData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Area type="monotone" dataKey="activeUsers" stroke="#D0A8F2" fill="#D0A8F2" name="Active Users" />
          <Area type="monotone" dataKey="totalUsers" stroke="#A6D8D2" fill="#A6D8D2" name="Total Users" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart;