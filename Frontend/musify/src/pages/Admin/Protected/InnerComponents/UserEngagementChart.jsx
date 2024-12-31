import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../../../axios/adminInterceptor';
import { UserEngagementChartShimmer } from './ChatShimmer';

const UserEngagementChart = () => {
  const [engagementData, setEngagementData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/content/user-engagement-metrics/');
        setEngagementData(response.data);
      } catch (error) {
        console.error('Error fetching user engagement data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <UserEngagementChartShimmer />;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 h-96">
      <h2 className="text-xl font-bold mb-4">User Engagement Metrics</h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart 
          data={engagementData}
          // Remove default hover behavior
          onMouseMove={(e) => e.isTooltipActive = false}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
            cursor={false} // This removes the hover rectangle
          />
          <Legend />
          <Bar 
            dataKey="postsPerUser" 
            fill="#8884d8" 
            name="Posts per User"
            isAnimationActive={false} // Optional: removes initial animation
          />
          <Bar 
            dataKey="sessionTime" 
            fill="#82ca9d" 
            name="Avg Session Time (min)"
            isAnimationActive={false}
          />
          <Bar 
            dataKey="interactionRate" 
            fill="#ffc658" 
            name="Interaction Rate (%)"
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserEngagementChart;