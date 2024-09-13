import React from 'react'

const Mastering = () => {
  return (
<section 
  className="relative flex items-center justify-center h-screen bg-cover bg-center"
  style={{ backgroundImage: "url('cover/editing.jpeg')" }}
>
  <div className="absolute  inset-0 bg-gradient-to-t from-c-black via-c-grey to-c-black opacity-[66%]"></div>
  
  <div className="absolute h-screen container mx-auto flex flex-col md:flex-row items-center justify-between p-6">
      <div className='w-full md:w-1/2 flex flex-col items-start mt-[100px] space-y-6 md:space-y-10 h-80 md:h-96'>
      
      <div className='flex items-center space-x-4'>


        <img src="logo/logo.png" alt="Musify Logo" className='w-10 h-10 mr-2'  />

         <h1 className=' font-mulish mt-[6px] text-4xl min-w-12  text-white'>
            <span className='font-bold'>Musify </span>
            <span className='font-extralight'>Mastering</span>
                      </h1>         

        
      </div>
      
          <p className=' font-mulish   text-base font-normal text-white w-[500px] mt-10 !important '> 
            Create and share your music anytime, anywhere. Connect with a global community of musicians, collaborate on projects, and showcase your talent to the world. 
            Engage with fans and fellow artists, and take your music to new heights.
          </p>
      
          <button className='btn-size font-mulish bg-[#731C1B] text-white font-semibold px-6 py-3 rounded-full hover:bg-opacity-90 transition mt-8'> 
            Let's Get Started
          </button>
        </div>
        <div className='w-full md:w-1/2 flex justify-center items-center mt-6 ml-[100px] md:mt-0'> 
  {/* Add items-center to vertically center the image within the container */}
  <img 
    src="music/sample.png"
    alt="music player"
    className='object-contain max-w-full' 
    // Use object-contain and max-w-full to keep the image within the bounds and centered
  />
</div>

      </div>
</section>

  )
}

export default Mastering