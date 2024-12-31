import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axiosInstance from '../../../../axios/adminInterceptor';
import { ContentDistributionChartShimmer } from './ChatShimmer';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const ContentDistributionChart = () => {
  const [distributionData, setDistributionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/content/distribution-data/');
        console.log('response', response)
        setDistributionData(response.data);
      } catch (error) {
        console.error('Error fetching content distribution data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ContentDistributionChartShimmer />;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-10 h-96">
      <h2 className="text-xl font-bold mb-4">Content Distribution</h2>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContentDistributionChart;