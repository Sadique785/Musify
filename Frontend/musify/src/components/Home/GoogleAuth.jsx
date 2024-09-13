import React from 'react'

const GoogleAuth = () => {
  return (
<section 
  className="relative flex items-center justify-center h-screen bg-cover bg-center"
  style={{ backgroundImage: "url('cover/musical_legends.png')" }}
>
  <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-700 to-black opacity-80"></div>
  
  <div className="relative z-10 text-center flex flex-col justify-center items-center  text-white px-4">
    <h2 className="font-mulish text-4xl font-bold  mb-8">
      MUSIC CREATION FOR ALL.
    </h2>
    <p className="font-mulish text-base mb-8 max-w-3xl leading-loose">
      Unleash your unique sound and craft your own style of music with ease and freedom. Connect with film industry professionals and showcase your talent to a global audience. Join a thriving community of creators and elevate your musical journey today.
    </p>
    <button className="flex items-center justify-center w-[300px] bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition">
      <img 
        src="logo/google.svg" 
        alt="Google Icon"
        className="w-6 h-6 mr-2"
      />
      Continue with Google
    </button>
  </div>
</section>

  )
}

export default GoogleAuth