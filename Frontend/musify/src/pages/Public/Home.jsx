import React from 'react'
import Header from '../../components/Public/navbars/Header'
import GetStarted from '../../components/Home/GetStarted'
import GoogleAuth from '../../components/Home/GoogleAuth'
import Mastering from '../../components/Home/Mastering'
import Review from '../../components/Home/Review'
import Footer from '../../components/Public/footers/Footer'





function Home() {
  return (
    <div className='flex flex-col snap-y snap-mandatory  '>

          <Header />
          <GetStarted />
          <GoogleAuth />
          <Mastering />
          <Review />
          <Footer />


    </div>
  )
}

export default Home