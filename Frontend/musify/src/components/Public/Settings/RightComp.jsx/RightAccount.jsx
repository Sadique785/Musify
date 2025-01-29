import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ProfileContext } from '../../../../context/ProfileContext';
import axiosInstance from '../../../../axios/authInterceptor';
import ConfirmationModal from './InnerComponents/ConfirmationModal';

function RightAccount() {
  const { profile, setProfile } = useContext(ProfileContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
    defaultValues: {
      currentEmail: profile.email,
      newEmail: ''
    }
  });

  const watchNewEmail = watch('newEmail');

  useEffect(() => {
    reset({
      currentEmail: profile.email,
      newEmail: ''
    });
  }, [profile.email, reset]);

  const handleEmailUpdate = async (data) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/send-email-otp/', {
        currentEmail: data.currentEmail,
        newEmail: data.newEmail
      });

      if (response.status === 200) {
        setNewEmail(data.newEmail);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const otp = event.target.otp.value;
      const response = await axiosInstance.post('/auth/update-email/', {
        currentEmail: profile.email,
        newEmail: newEmail,
        otp: otp
      });

      if (response.status === 200) {
        setProfile(prev => ({ ...prev, email: newEmail }));
        setIsModalOpen(false);
        reset({
          currentEmail: newEmail,
          newEmail: ''
        });
      }
    } catch (error) {
      console.error('Failed to update email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidNewEmail = watchNewEmail && 
    watchNewEmail !== profile.email && 
    !errors.newEmail;

  return (
    <div className="w-full  lg:w-2/3 p-6">
      <h2 className="text-2xl font-bold mb-6">ACCOUNT SETTINGS</h2>

      {/* Email Section */}
      <h3 className="text-xl font-semibold mb-9">EMAIL</h3>

      {/* Email Form */}
      <form onSubmit={handleSubmit(handleEmailUpdate)} className="flex flex-col space-y-4">
        {/* Current Email */}
        <div className="mb-4">
          <label htmlFor="currentEmail" className="block text-gray-600 mb-3">
            Current Email
          </label>
          <input
            id="currentEmail"
            type="email"
            {...register('currentEmail')}
            disabled
            className="pl-4 pr-4 py-2 border mb-2 border-gray-300 rounded-md bg-gray-200 w-full cursor-not-allowed"
          />
        </div>

        {/* New Email */}
        <div className="mb-4">
          <label htmlFor="newEmail" className="block text-gray-600 mb-3">
            New Email
          </label>
          <input
            id="newEmail"
            type="email"
            {...register('newEmail', {
              required: 'New email is required',
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: 'Please enter a valid email address',
              },
              validate: (value) => 
                value !== profile.email || 'New email must be different from current email'
            })}
            className="pl-4 pr-4 py-2 border mb-2 border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#6d6d6d] focus:border-teal-100 w-full"
          />
          {errors.newEmail && (
            <p className="text-red-600 text-sm">{errors.newEmail.message}</p>
          )}
        </div>

        {/* Update Button */}
        <button
          type="submit"
          disabled={!isValidNewEmail || isLoading}
          className={`px-4 py-2 w-36 rounded-full text-white font-bold text-lg self-start ${
            !isValidNewEmail || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Sending...
            </div>
          ) : (
            'Update'
          )}
        </button>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentEmail={profile.email}
        newEmail={newEmail}
        onConfirm={handleOTPSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default RightAccount;