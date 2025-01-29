import React from 'react';
import { useSelector } from 'react-redux'; // Import useSelector to access Redux state
import RightAccount from './RightComp.jsx/RightAccount';
import RightProfile from './RightComp.jsx/RightProfile';
import RightCollab from './RightComp.jsx/RightCollab';
import RightNotification from './RightComp.jsx/RightNotification';
import RightPrivacy from './RightComp.jsx/RightPrivacy';

function SettingsRight() {
  // Access the selectedSettings from Redux store
  const selectedSettings = useSelector((state) => state.settings.selectedSettings);

  // Function to render the component based on selectedSettings
  const renderRightComponent = () => {
    switch (selectedSettings) {
      case 'profile':
        return <RightProfile />;
      case 'account':
        return <RightAccount />;
      case 'collaborations':
        return <RightCollab />;
      case 'notifications':
        return <RightNotification />;
      case 'privacy':
        return <RightPrivacy />;
      default:
        return <RightProfile />; // Default case if none match
    }
  };

  return (
    <div className="p-4 lg:ml-20">
      {renderRightComponent()}
    </div>
  );
}

export default SettingsRight;
