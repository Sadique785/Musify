import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import Header from '../../components/Public/navbars/Header';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Corrected state name
  const [otp, setOtp] = useState(''); // Added state for OTP
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState(''); // Added state for OTP error
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(''); // Added state for confirm password error
  const [step, setStep] = useState(1); // Added step state to handle form steps

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setEmailError('');
    setOtpError('');

    if (email.trim() === '') {
      setEmailError('Email is required.');
      return;
    }

    try {
      // Make a request to your backend to send OTP
      const response = await axios.post('/api/forgot-password/send-otp', { email });
      if (response.data.success) {
        // If OTP is sent successfully, move to the next step
        setStep(2);
      } else {
        setEmailError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setEmailError('An error occurred while sending OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setOtpError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (otp.trim() === '') {
      setOtpError('OTP is required.');
      return;
    }

    if (password.trim() === '') {
      setPasswordError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setPasswordError('At least 6 characters are required.');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }

    try {
      // Make a request to your backend to reset the password
      const response = await axios.post('/api/forgot-password/reset', { email, otp, password });
      if (response.data.success) {
        // Handle successful password reset (e.g., redirect to login page)
        alert('Password reset successfully!');
      } else {
        setOtpError('Invalid OTP or failed to reset password.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setOtpError('An error occurred while resetting password.');
    }
  };

  return (
    <div className='relative h-screen '>
      <Header className='bg-transparent' />
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: 'url(cover/musical_legends.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <form onSubmit={step === 1 ? handleSendOtp : handleResetPassword} className="mt-6 bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div className='flex items-center justify-center mb-6'>
              <span className='text-gray-700 text-2xl font-bold'>{step === 1 ? 'Forgot your Password' : 'Create a New Password'}</span>
            </div>

            {step === 1 ? (
              <>
                <div className='mb-4'>
                  <label htmlFor="email" className='block text-left text-gray-700 font-semibold mb-2'>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Email'
                    className='w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200'
                  />
                  {emailError && <p className='text-red-500 text-sm font-medium mt-1'>{emailError}</p>}
                </div>

                <button type="submit" className='w-full h-[45px] bg-gray-800 text-white rounded-full hover:bg-gray-700 transition mb-6'>
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <div className='mb-4'>
                  <label htmlFor="otp" className='block text-left text-gray-700 font-semibold mb-2'>OTP</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder='Enter OTP'
                    className='w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200'
                  />
                  {otpError && <p className='text-red-500 text-sm font-medium mt-1'>{otpError}</p>}
                </div>

                <div className='mb-4'>
                  <label htmlFor="password" className='block text-left text-gray-700 font-semibold mb-2'>New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200"
                  />
                  {passwordError && <p className='text-red-500 text-sm font-medium mt-1'>{passwordError}</p>}
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className='mb-4'>
                  <label htmlFor="confirmPassword" className='block text-left text-gray-700 font-semibold mb-2'>Confirm Password</label>
                  <input
                    type='password'
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm Password'
                    className='w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200'
                  />
                  {confirmPasswordError && <p className='text-red-500 text-sm font-medium mt-1'>{confirmPasswordError}</p>}
                </div>

                <button type="submit" className='w-full h-[45px] bg-gray-800 text-white rounded-full hover:bg-gray-700 transition mb-6'>
                  Reset Password
                </button>
              </>
            )}



            {/* Removed Google Auth section */}

            <div className="text-center mb-4">
              <span className="text-gray-400 text-xs font-medium block">
                By continuing, you agree to Musify's
              </span>
              <span className="text-gray-400 text-xs font-medium block">
                <a href="/terms" className="text-gray-500 hover:underline">Terms of Use</a> and 
                <a href="/privacy" className="text-gray-500 hover:underline"> Privacy Policy</a>
              </span>
            </div>

            <div className="text-center">
              <span className="text-gray-400 text-xs font-medium">Already have an account? </span>
              <Link to="/login" className="text-gray-500 text-sm hover:underline font-semibold">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
