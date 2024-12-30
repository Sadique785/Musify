import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import LibItem from './InnerComponents/LibItem';
import FilterDropdown from './InnerComponents/FilterDropdown';
import axiosInstance from '../../../axios/authInterceptor';
function LibMid() {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/content/library-media/');
        console.log('API Response:', response.data); // Console log the response data
        setProjects(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
      {/* Sticky Header Section */}
      <div className="sticky top-[70px] bg-white z-10 p-6 border-b">
        {/* Filter and Search Section */}
        <div className="flex w-full gap-4">
          {/* Filter Dropdown - 1/5 width */}
          <div className="w-1/5">
            <FilterDropdown 
              selected={filter}
              onSelect={setFilter}
            />
          </div>
  
          {/* Search Bar - 4/5 width */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-gray-100 focus:outline-none text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          </div>
        </div>
      </div>
  
      {/* Scrollable Projects List */}
      <div className="flex-1 overflow-y-auto p-4">
        {projects?.map((project) => (
          <LibItem key={project?.id} project={project} />
        ))}
      </div>

    </div>
  );
}

export default LibMid;