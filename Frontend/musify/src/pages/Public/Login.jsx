import React, { useState } from 'react';
import Header from '../../components/Public/navbars/Header';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import axiosInstance from '../../axios/axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/auth/Slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';



function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const acc = useSelector((state) => state.auth.accessToken);
  console.log(acc, 'acc');
  
  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      console.log(tokenResponse)
      const accessToken = tokenResponse.access_token;


      try{

        const response = await axiosInstance.post('/auth/google-login/',{
          access_token:accessToken
        });

        if (response.status == 200){
          console.log("Login Success");
          console.log(response);
          dispatch(loginSuccess({
            user:response.data.data.user,
            accessToken:response.data.data.accessToken,
            refreshToken:response.data.data.refreshToken,
            csrfToken:response.data.data.csrfToken,

          }));

          setTimeout(() => {
            navigate('/feed')
          }, 2000);

          console.log(user);
          
          
          
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

    setEmailError('')
    setPasswordError('')

    let isValid = true

    if(email.trim() === ''){
      setEmailError('Email is required.');
      // toast.error('Email is required.');
      isValid = false;
      return
    }

    if(password.trim() === ''){
      setPasswordError('Password is required.');
      isValid = false;
      return
    }

    if (!isValid) return;

    try {

      const response = await axiosInstance.post('/auth/login/',
        { email, password },
        { withCredentials: true });


        if (response.status === 200) {
          console.log('Csrf from response :',response.data.data.csrfToken );
          
          toast.success('Login Success')

          dispatch(loginSuccess({
            user:response.data.data.user,
            accessToken:response.data.data.accessToken,
            refreshToken:response.data.data.refreshToken,
            csrfToken:response.data.data.csrfToken,

          }));

          setTimeout(() => {
            navigate('/feed')
          },2000)
        }

    } catch (error) {
      if (error.response && error.response.data) {
        console.log(error);
  
        const nonFieldErrors = error.response.data.non_field_errors;
        if (nonFieldErrors && nonFieldErrors.length > 0) {
          toast.error(nonFieldErrors[0]); 
        }
  
        const emailError = error.response.data.email;
        const passwordError = error.response.data.password;
  
        if (emailError) {
          toast.error(emailError);
          setEmailError(emailError);
        }
  
        if (passwordError) {
          toast.error(passwordError);
          setPasswordError(passwordError);
        }
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }


    // Here you can send email and password to the backend
    console.log('Submitted Email:', email);
    console.log('Submitted Password:', password);



  };

  return (
    <div className='relative h-screen'>
      <Header className='bg-transparent' />
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: 'url(cover/musical_legends.png)' }}
      >

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div className='flex items-center justify-center mb-6'>
              <img
                src="logo/logo_2.png"
                alt="Musify"
                className="w-9 h-9"
              />
              <span className='text-black text-xl font-bold'>Musify</span>
            </div>

            <div className='mb-4'>
              <label htmlFor="email" className='block text-left text-gray-700 font-semibold mb-2'>Email</label>
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
                className='w-full p-3 border h-[45px] bg-gray-100 border-gray-100 rounded focus:outline-none focus:border-gray-200'
              />
              {emailError && <p className='text-red-500 text-sm font-medium mt-1' >{emailError}</p>}
            </div>

            <div className="mb-4 relative">
              <label htmlFor="password" className='block text-left text-gray-700 font-semibold mb-2'>Password</label>
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

            <div className="text-center mb-4">
              <Link to={'/forgot-password'} className='text-gray-500 text-sm hover:underline'>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className='w-full h-[45px] bg-gray-800 text-white rounded-full hover:bg-gray-700 transition mb-6'>
              Login
            </button>

            <div className="flex items-center justify-center mb-4">
              <span className="w-full max-w-[100px] border-t border-gray-300"></span>
              <span className="px-3 text-gray-500 text-sm">or continue with</span>
              <span className="w-full max-w-[100px] border-t border-gray-300"></span>
            </div>

            <div className="flex justify-center">
              <button onClick={() => login()} type="button" className="w-[100px] h-[45px] bg-gray-100 text-black border-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 hover:border-gray-500 transition mb-4">
                <FcGoogle className="h-7 w-7" />
              </button>
            </div>
            <div className="text-center">
              <span className="text-gray-400 text-xs font-medium">Don't have an account? </span>
              <Link to="/register" className="text-gray-500 text-sm hover:underline font-semibold">
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
