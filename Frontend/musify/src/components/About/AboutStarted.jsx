import React from 'react';
import { FaPlus } from 'react-icons/fa';

const AboutStarted = () => {
  return (
    <section className='custom-gradient py-10 snap-start h-screen flex flex-col items-center justify-center mt-31'>
      <div className="text-center mt-[100px] max-w-3xl px-4 md:px-0">
        <h1 className='text-3xl md:text-6xl font-bold text-white font-mulish mb-4'>
          Fast, High Quality Online Mastering</h1>
        <p className='text-xs md:text-sm text-white mb-10'>
          Instantly master your tracks with the world’s leading online mastering service. Hear the difference mastering can make with the fastest, best sounding, and free artist-driven Mastering tool.
        </p>
      </div>

      <div className="bg-gradient-to-r from-c-red-light to-c-dark-red2 h-52 md:h-60 w-[300px] md:w-[900px] rounded-3xl md:rounded-full flex flex-col items-center justify-between pt-2 pb-6">
        <div className='bg-white opacity-70 mt-5 rounded-full  h-12 w-12 md:h-20 md:w-20 flex items-center justify-center mb-[-10px]'>
          <FaPlus className='text-c-red-light text-2xl md:text-4xl' />
        </div>

        <h2 className="text-lg md:text-2xl font-semibold text-white mb-2">Import your track</h2>
        <p className="text-xs text-white md:text-sm ">Select any audio file</p>
      </div>
    </section>
  );
}

export default AboutStarted;
