import React from 'react'
import { FaInstagram, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return  (
    <footer className='bg-black h-[50vh] text-white p-8'>
      <div className='container mx-auto flex justify-between'>

        {/* Left Section */}
        <div className='flex flex-col'>
          <a href="/"
            className='flex items-center  text-white mb-[50px]'>
            <img src="logo/logo.png" alt="Logo" className='h-6 mr-2' />
            <span className="text-xl font-bold">Musify</span>
          </a>

          <div className='flex space-x-4'>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-xl hover:text-pink-500" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-xl hover:text-blue-400" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="text-xl hover:text-blue-600" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub className="text-xl hover:text-gray-500" />
            </a>
          </div>
        </div>

        {/* Right Section */}
        <div className='flex flex-col space-y-8'>
          {/* Lists */}
          <div className='flex space-x-12'>
            <ul className="space-y-2">
              <li className="font-bold text-sm">Features</li>
              <li><a href="#" className="text-xs hover:underline">Membership</a></li>
              <li><a href="#" className="text-xs hover:underline">Studio</a></li>
              <li><a href="#" className="text-xs hover:underline">Effects</a></li>
              <li><a href="#" className="text-xs hover:underline">Mastering</a></li>
            </ul>

            <ul className="space-y-2">
              <li className="font-semibold text-sm">Company</li>
              <li><a href="#" className="text-xs hover:underline">Careers</a></li>
              <li><a href="#" className="text-xs hover:underline">About Us</a></li>
              <li><a href="#" className="text-xs hover:underline">Contact Us</a></li>
            </ul>
          </div>

          {/* Additional Links */}
          <div className='flex flex-col space-y-1 mt-4'>
            <p className="text-xs mt-[50px]">2024 Musify Technologies</p>
            <div className='flex space-x-4'>
              <a href="#" className="text-xs mt-4 hover:underline">Privacy Policy</a>
              <a href="#" className="text-xs mt-4 hover:underline">Terms of Use</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer

