import React from 'react';
import { useSelector } from 'react-redux';
import MidFollowing from './MidSection/midFollowing'; // Correct capitalization
import MidMusic from './MidSection/midMusic';
import MidTrending from './MidSection/midTrending';

function FeedMid() {
  const selectedContent = useSelector((state) => state.content.selectedContent);

  const renderContent = () => {
    switch (selectedContent) {
      case 'trending':
        return <MidTrending />;
      case 'music':
        return <MidMusic />;
      case 'following':
        return <MidFollowing />;
      default:
        return <MidTrending />; // Default to 'Trending' if nothing is selected
    }
  };

  return (
    <div className="main-content">
      {renderContent()}
    </div>
  );
}

export default FeedMid;
