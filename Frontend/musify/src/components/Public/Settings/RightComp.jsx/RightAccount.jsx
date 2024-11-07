import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ProfileContext } from '../../../../context/ProfileContext';
import axiosInstance from '../../../../axios/authInterceptor';

function RightAccount() {
  const { profile, setProfile } = useContext(ProfileContext);
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    defaultValues: { email: profile.email }
  });

  useEffect(() => {
    reset({ email: profile.email });
  }, [profile.email, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post('/auth/update-email/', { email: data.email });
      if (response.status === 200) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          email: data.email,
        }));
        console.log('Email updated successfully');
      }
    } catch (error) {
      console.error('Failed to update email:', error);
    }
  };

  return (
    <div className="w-2/3 p-6">
      <h2 className="text-2xl font-bold mb-6">ACCOUNT SETTINGS</h2>
  
      {/* Email Section */}
      <h3 className="text-xl font-semibold mb-9">EMAIL</h3>
      <label htmlFor="email" className="block text-gray-600 mb-3">Enter your email</label>
  
      {/* Email Input */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: 'Please enter a valid email address',
            },
          })}
          className="pl-4 pr-4 py-2 border mb-5 border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#6d6d6d] focus:border-teal-100 w-full"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
  
        {/* Update Button */}
        <button
          type="submit"
          disabled={!isDirty || errors.email}
          className={`px-4  py-2 w-36 rounded-full text-white font-bold text-lg self-start ${
            !isDirty || errors.email ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Update
        </button>
      </form>
  
      {/* Separation Line */}
      <hr className="my-10 border-gray-300" />
  
      {/* Change Password Section */}
      <h3 className="text-xl font-semibold mb-3">CHANGE PASSWORD</h3>
      <p className="text-gray-600 text-sm mb-4">Change your password</p>
      <button
        onClick={() => console.log('Password reset')}
        className="px-4 py-2 w-56 rounded-full text-white font-bold text-lg bg-gray-700 hover:bg-gray-900 self-start"
      >
        Change Password
      </button>
    </div>
  );
  
  
}

export default RightAccount;
