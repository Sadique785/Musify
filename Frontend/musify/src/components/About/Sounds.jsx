import React from 'react'

function Sounds() {
  return (
    <section className='min-h-screen w-full bg-gradient-to-b from-[#000000] via-[#270404] to-[#000000] flex flex-col items-center justify-center px-4  py-10'>
        <div className='text-center mb-8'>
        <h1 className='text-3xl md:text-5xl font-bold text-white mb-4'>Your music, your sound</h1>
        <p className='text-white text-xs md:text-sm'>
          Experience a new level of sound quality with our innovative mastering service. Your music, customized to perfection.
        </p>
      </div>

      {/* Images Section */}
      <div className='relative w-full overflow-hidden'>
          <div className='hidden ml-16 md:grid grid-cols-4 gap-6 mt-10 pb-[10px] justify-center'>
            <img src='content/filter1.png' alt='Image 1' className='h-[350px] w-50 object-cover rounded-md' />
            <img src='content/filter2.png' alt='Image 2' className='h-[350px] w-50 object-cover rounded-md' />
            <img src='content/filter3.png' alt='Image 3' className='h-[350px] w-50 object-cover rounded-md' />
            <img src='content/filter4.png' alt='Image 4' className='h-[350px] w-50 object-cover rounded-md' />
            <img src='content/filter3.png' alt='Image 5' className='h-[350px] w-50 object-cover rounded-md' />
            <img src='content/filter2.png' alt='Image 6' className='h-[350px] w-50 object-cover rounded-md' />
            <img src='content/filter4.png' alt='Image 7' className='h-[350px] w-50 object-cover rounded-md' />
            <img src='content/filter1.png' alt='Image 8' className='h-[350px] w-50 object-cover rounded-md' />
          </div>

          {/* For smaller screens */}
          <div className='block md:hidden mt-10 pb-[10px]'>
            <div className='flex space-x-4 overflow-x-auto'>
              <img src='content/filter1.png' alt='Image 1' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
              <img src='content/filter2.png' alt='Image 2' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
              <img src='content/filter3.png' alt='Image 3' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
              <img src='content/filter4.png' alt='Image 4' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
              <img src='content/filter3.png' alt='Image 5' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
              <img src='content/filter2.png' alt='Image 6' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
              <img src='content/filter4.png' alt='Image 7' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
              <img src='content/filter1.png' alt='Image 8' className='h-[300px] w-[150px] object-cover rounded-md flex-shrink-0' />
            </div>
          </div>
        </div>
    </section>
  )
}

export default Sounds