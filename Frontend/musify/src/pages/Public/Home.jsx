import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from '../../components/Public/navbars/Header'
import GetStarted from '../../components/Home/GetStarted'
import GoogleAuth from '../../components/Home/GoogleAuth'
import Mastering from '../../components/Home/Mastering'
import Review from '../../components/Home/Review'
import Footer from '../../components/Public/footers/Footer'





function Home() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken)

  useEffect(() => {
    if (token === ''){
      navigate('/feed');
    }

  },[token, navigate]);

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