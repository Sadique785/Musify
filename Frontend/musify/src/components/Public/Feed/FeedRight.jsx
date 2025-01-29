import React, { useState, useEffect } from 'react';
import { UserPlus, User } from 'lucide-react';
import axiosInstance from '../../../axios/authInterceptor';


const FeedRight = () => {
  const [peopleToFollow, setPeopleToFollow] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnfollowedAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get('/friends/unfollowed-accounts/');
        setPeopleToFollow(response.data);
      } catch (err) {
        setError('Failed to fetch suggestions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnfollowedAccounts();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed right-0 w-72 p-4 border-gray-200 h-screen">
        <h2 className="text-md font-bold mb-4 text-gray-800">People To Follow</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex flex-col gap-2">
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                  <div className="w-20 h-2 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed right-0 w-72 p-4 border-gray-200 h-screen">
        <h2 className="text-md font-bold mb-4 text-gray-800">People To Follow</h2>
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 w-72 p-4 border-gray-200 h-screen">
      <h2 className="text-md font-bold mb-4 text-gray-800">People To Follow</h2>
      
      <div className="space-y-4">
        {peopleToFollow.map((person) => (
          <div key={person.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {person.avatar ? (
                  <img 
                    src={person.avatar} 
                    alt={person.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-500" />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{person.username}</span>
                <span className="text-gray-500 text-xs">@{person.handle || person.username.toLowerCase().replace(' ', '_')}</span>
              </div>
            </div>
            
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label={`Follow ${person.username}`}
            >
              <UserPlus className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        
        {peopleToFollow.length === 0 && (
          <div className="text-sm text-gray-500 text-center">
            No suggestions available at the moment
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedRight;