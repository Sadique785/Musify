import React from 'react'
import Header from '../../components/Public/navbars/Header'
import AboutStarted from '../../components/About/AboutStarted'
import Sounds from '../../components/About/Sounds'
import Review from '../../components/Home/Review'
import Footer from '../../components/Public/footers/Footer'



function About() {
  return (
    <div className='flex flex-col snap-y snap-mandatory  '>

          <Header />
          <AboutStarted />
          <Sounds />
          <Review />
          <Footer />


    </div>
  )
}

export default About