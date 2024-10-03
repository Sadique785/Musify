import React from 'react'
import SettingsLeft from '../../components/Public/Settings/SettingsLeft'
import SettingsRight from '../../components/Public/Settings/SettingsRight'

function Settings() {
    return (
      <div className='flex'>
        {/* Adjust the width of SettingsLeft and SettingsRight using Tailwind's width classes */}
        <div className='w-1/4 p-4 sticky top-20 h-[calc(100vh-8rem)]  feed-container'>
          <SettingsLeft />
        </div>
        <div className='w-3/4 p-4 feed-container overflow-y-auto h-[calc(100vh-8rem)]  '>
          <SettingsRight />
        </div>
      </div>
    );
  }
  
  export default Settings;