import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from '../../components/Public/navbars/Header'
import AboutStarted from '../../components/About/AboutStarted'
import Sounds from '../../components/About/Sounds'
import Review from '../../components/Home/Review'
import Footer from '../../components/Public/footers/Footer'



function About() {
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
          <AboutStarted />
          <Sounds />
          <Review />
          <Footer />


    </div>
  )
}

export default About