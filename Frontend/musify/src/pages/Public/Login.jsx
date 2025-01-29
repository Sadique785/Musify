import React, { useState, useEffect } from 'react';
import Header from '../../components/Public/navbars/Header';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import axiosInstance from '../../axios/axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/auth/Slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { getBackendUrl } from '../../services/config';





function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  // const { backendUrl } = getConfig();
  const backendUrl = getBackendUrl();
  const [ loading, setLoading ] = useState(false);

  

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.accessToken)

  useEffect(() => {
    if (token){
      navigate('/feed');
    }

  },[token, navigate]);
  
  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      const accessToken = tokenResponse.access_token;


      try{

        const response = await axiosInstance.post('/auth/google-login/',{
          access_token:accessToken
        });

        if (response.status == 200){
          dispatch(loginSuccess({
            user:response.data.data.user,
            accessToken:response.data.data.accessToken,
            refreshToken:response.data.data.refreshToken,
            csrfToken:response.data.data.csrfToken,

          }));

          setTimeout(() => {
            navigate('/feed')
          }, 2000);

          
          
          
        }

      } catch (error){
        if (error.response && error.response.data) {
          const nonFieldErrors = error.response.data.non_field_errors;
          
          if (nonFieldErrors && nonFieldErrors.length > 0) {
            toast.error(nonFieldErrors[0]);
          }
        } else {
          toast.error('An error occurred. Please try again.');
        }

      }


      
    }
  });


  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setEmailError('');
    setPasswordError('');

    let isValid = true;

    if(email.trim() === '') {
      setEmailError('Email is required.');
      isValid = false;
      return;
    }

    if(password.trim() === '') {
      setPasswordError('Password is required.');
      isValid = false;
      return;
    }

    if (!isValid) return;

    setLoading(true);


    try {
      
      const response = await axiosInstance.post('/auth/login/', {
        email,
        password
      });

      if (response.status === 200) {
        
        toast.success('Login Success');

        dispatch(loginSuccess({
          user: response.data.data.user,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          csrfToken: response.data.data.csrfToken,
        }));

        setTimeout(() => {
          navigate('/feed');
        }, 2000);
      }

    } catch (error) {
      console.error('Login error:', error); // Debug log
      
      if (error.response && error.response.data) {
        const nonFieldErrors = error.response.data.non_field_errors;
        if (nonFieldErrors && nonFieldErrors.length > 0) {
          toast.error(nonFieldErrors[0]); 
        }

        const { email: emailError, password: passwordError } = error.response.data;
  
        if (emailError) {
          toast.error(emailError);
          setEmailError(emailError);
        }
  
        if (passwordError) {
          toast.error(passwordError);
          setPasswordError(passwordError);
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
};

return (
  <div className='relative min-h-screen'>
    <Header className='bg-transparent' />
    <div
      className='absolute inset-0 bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: 'url(cover/musical_legends.png)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
      <div className="relative z-10 flex items-center justify-center h-full px-4 py-8">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md"
        >
          <div className='flex items-center justify-center mb-4 sm:mb-6'>
            <img
              src="logo/logo_2.png"
              alt="Musify"
              className="w-7 h-7 sm:w-9 sm:h-9 mr-2"
            />
            <span className='text-black text-lg sm:text-xl font-bold'>Musify</span>
          </div>

          <div className='mb-3 sm:mb-4'>
            <label htmlFor="email" className='block text-left text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base'>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value.trim() !== ''){
                  setEmailError('');
                }
              }}
              placeholder='Email'
              className='w-full p-2 sm:p-3 border h-[40px] sm:h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200 text-sm sm:text-base'
            />
            {emailError && <p className='text-red-500 text-xs sm:text-sm font-medium mt-1' >{emailError}</p>}
          </div>

          <div className="mb-3 sm:mb-4 relative">
            <label htmlFor="password" className='block text-left text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base'>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.trim() !== ''){
                  setPasswordError('');
                }
              }}
              placeholder="Password"
              className="w-full p-2 sm:p-3 border h-[40px] sm:h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200 text-sm sm:text-base"
            />
            {passwordError && <p className='text-red-500 text-xs sm:text-sm font-medium mt-1'>{passwordError}</p>}
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-500"
            >
              {showPassword ? <FaEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          <div className="text-center mb-3 sm:mb-4">
            <Link to={'/forgot-password'} className='text-gray-500 text-xs sm:text-sm hover:underline'>
              Forgot Password?
            </Link>
          </div>

          <button 
              type="submit" 
              disabled={loading}
              className={`w-full h-[40px] sm:h-[45px] rounded-full transition text-sm sm:text-base ${
                loading 
                  ? 'bg-gray-500 cursor-not-allowed text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  Logging in <FaSpinner className="animate-spin ml-2 h-4 w-4" />
                </div>
              ) : (
                'Login'
              )}
            </button>

          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <span className="w-full max-w-[100px] border-t border-gray-300"></span>
            <span className="px-3 text-gray-500 text-xs sm:text-sm">or continue with</span>
            <span className="w-full max-w-[100px] border-t border-gray-300"></span>
          </div>

          <div className="flex justify-center mb-3 sm:mb-4">
            <button 
              onClick={() => login()} 
              type="button" 
              className="w-[80px] sm:w-[100px] h-[40px] sm:h-[45px] bg-gray-100 text-black border-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 hover:border-gray-500 transition"
            >
              <FcGoogle className="h-5 w-5 sm:h-7 sm:w-7" />
            </button>
          </div>
          <div className="text-center">
            <span className="text-gray-400 text-xs font-medium">Don't have an account? </span>
            <Link to="/register" className="text-gray-500 text-xs sm:text-sm hover:underline font-semibold">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
    <Toaster />
  </div>
);
}

export default Login;
