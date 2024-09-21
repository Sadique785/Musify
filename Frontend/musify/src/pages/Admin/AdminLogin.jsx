import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast'; // Import toast
import axiosInstance from '../../axios/adminInterceptor';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useDispatch } from 'react-redux'; // Import useDispatch
import { loginSuccess } from '../../redux/auth/Slices/authSlice'; // Import your action

function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Create dispatch instance

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post('/admin-side/admin-login/', data);
      
      console.log('Login successful:', response.data);
      toast.success('Login successful!');

      // Dispatch loginSuccess action with user data and tokens
      dispatch(loginSuccess({
        user: response.data.data.user, // Assuming your response structure includes user data
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      }));

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      toast.error('Login failed. Please check your credentials.'); // Toast for error
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
              className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : ''
              }`}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
