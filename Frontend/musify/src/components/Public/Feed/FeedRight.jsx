import React from 'react';
import { UserPlus, User } from 'lucide-react';

function FeedRight() {
  const peopleToFollow = [
    {
      id: 1,
      username: "Sarah Johnson",
      handle: "@sarahj_dev",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      username: "Alex Chen",
      handle: "@alexc_tech",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      username: "Maria Garcia",
      handle: "@maria_design",
      avatar: "/api/placeholder/40/40"
    }
  ];

  return (
    <div className="fixed right-0 w-72 p-4  border-gray-200 h-screen">
      <h2 className="text-md font-bold mb-4 text-gray-800">People To Follow</h2>
      
      <div className="space-y-4">
        {peopleToFollow.map((person) => (
          <div key={person.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {/* Placeholder avatar with User icon */}
                <User className="w-6 h-6 text-gray-500" />
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{person.username}</span>
                <span className="text-gray-500 text-xs">{person.handle}</span>
              </div>
            </div>
            
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors">
              <UserPlus className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeedRight;