import React from 'react'
import LeftSection from '../../components/Public/Sections/LeftSection'
import RightSection from '../../components/Public/Sections/RightSection'
import MiddleSection from '../../components/Public/Sections/MiddleSection'

function Library() {
  return (
    <div>
      <div className="flex  ">
        <LeftSection />
        <MiddleSection />
        <RightSection />
      </div>

    </div>

    
  );
}

export default Library