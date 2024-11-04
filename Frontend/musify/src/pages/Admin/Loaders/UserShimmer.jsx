// Shimmer.js
import React from 'react';
import './Shimmer.css'; // Create this CSS file for shimmer styling

function UserShimmer() {
  return (
    <div className="shimmer-wrapper">
      <div className="shimmer-user-left">
        <div className="shimmer-circle"></div>
        <div className="shimmer-line shimmer-username"></div>
        <div className="shimmer-stats">
          <div className="shimmer-line shimmer-stat"></div>
          <div className="shimmer-line shimmer-stat"></div>
          <div className="shimmer-line shimmer-stat"></div>
        </div>
      </div>

      <div className="shimmer-user-right">
        <div className="shimmer-activity">
          <div className="shimmer-line shimmer-activity-title"></div>
          <div className="shimmer-line shimmer-activity-stat"></div>
          <div className="shimmer-line shimmer-activity-stat"></div>
          <div className="shimmer-line shimmer-activity-stat"></div>
        </div>
        <div className="shimmer-buttons">
          <div className="shimmer-button"></div>
          <div className="shimmer-button"></div>
        </div>
      </div>
    </div>
  );
}

export default UserShimmer;
