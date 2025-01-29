import React from 'react';
import { Link } from 'react-router-dom';

const GetStarted = () => {
  return (
    <section className='custom-gradient bg-white py-10 snap-start h-screen flex-grow flex items-center justify-center'>
      <div className="h-screen container mx-auto flex flex-col md:flex-row items-center justify-between p-6">
      <div className='w-full md:w-1/2 flex flex-col items-start space-y-6 md:space-y-10 h-80 md:h-96'>
      <h1 className=' font-mulish mt-[56px] text-4xl md:text-6xl font-bold text-white'>
            Create Music and Connect with Musicians
          </h1>
          {/* Increased mt to check if it's noticeable */}
          <p className=' font-mulish   text-base font-normal text-white w-[500px] mt-10 !important '> 
            Create and share your music anytime, anywhere. Connect with a global community of musicians, collaborate on projects, and showcase your talent to the world. 
            Engage with fans and fellow artists, and take your music to new heights.
          </p>
          <Link to={'/login'}>
          <button className='btn-size font-mulish bg-[#731C1B] text-white font-semibold px-6 py-3 rounded-full hover:bg-opacity-90 transition mt-8'> 
            Let's Get Started
          </button>
          </Link>
        </div>
    <div className='w-full md:w-1/2 flex justify-center mt-6 md:mt-0'>
    <img 
    src="cover/cover1.png"
     alt="Get Started"
     className='object-cover w-[620px] h-[580px] mt-[210px] ml-[150px] '
      />

    </div>

      </div>
    </section>
  );
};

export default GetStarted;
