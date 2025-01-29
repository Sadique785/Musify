import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast'; 
import axiosInstance from '../../axios/adminInterceptor';
import { useNavigate } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { loginSuccess } from '../../redux/auth/Slices/authSlice'; 
import { FaSpinner } from 'react-icons/fa';  // Import spinner icon
import { useSelector } from 'react-redux';

function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken)
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);  // Loading state

  useEffect(() => {
    if (token){
      navigate('/admin/dashboard')
    }

  }, [token, navigate])
  

  const onSubmit = async (data) => {
    setLoading(true);  // Start loading animation
    try {
      const response = await axiosInstance.post('/admin-side/admin-login/', data);
      
      console.log('Login successful:', response.data);
      toast.success('Login successful!');
  
      // Dispatch login success action to store the tokens and user info
      dispatch(loginSuccess({
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        csrfToken: response.data.data.csrfToken,
      }));
  
      // Stop loading, then immediately navigate
      setLoading(false);  // Stop loading animation
      navigate('/admin/dashboard');  // Navigate right after loading stops
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      toast.error('Login failed. Please check your credentials.');
      setLoading(false);  // Stop loading animation in case of failure
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9c9c9] ${
                errors.email ? 'border-[#2f2d2d]' : ''
              }`}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <p className="text-[#E74C3C] text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9c9c9] ${
                errors.password ? 'border-[#2f2d2d]' : ''
              }`}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && <p className="text-[#E74C3C] text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}  // Disable button while loading
            className={`w-full py-2 px-4 rounded-md text-white ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#380E0D] hover:bg-[#3a1514]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                Logging in <FaSpinner className="animate-spin ml-2" />  {/* Spinner with "Logging in" */}
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
