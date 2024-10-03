import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast'; 
import axiosInstance from '../../axios/adminInterceptor';
import { useNavigate } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { loginSuccess } from '../../redux/auth/Slices/authSlice'; 

function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post('/admin-side/admin-login/', data);
      
      console.log('Login successful:', response.data);
      toast.success('Login successful!');

      dispatch(loginSuccess({
        user:response.data.data.user,
        accessToken:response.data.data.accessToken,
        refreshToken:response.data.data.refreshToken,
        csrfToken:response.data.data.csrfToken,
      }));

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      toast.error('Login failed. Please check your credentials.');
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
            className="w-full bg-[#380E0D] hover:bg-[#3a1514] text-white py-2 px-4 rounded-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
