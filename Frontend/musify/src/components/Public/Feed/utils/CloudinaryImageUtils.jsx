import axiosInstance from '../../../../axios/authInterceptor';
import axios from 'axios';
import { getConfig } from '../../../../config';

export class CloudinaryImageUtils {
  constructor() {
    const { cloudinaryUrl: baseCloudinaryUrl } = getConfig();
    this.cloudinaryUrl = `${baseCloudinaryUrl}/upload`;
    console.log('Using Cloudinary URL:', this.cloudinaryUrl);
  }

  async verifySession() {
    try {
      const response = await axiosInstance.get('/content/verify-user/');
      console.log('Session verification successful');
      return true;
    } catch (error) {
      console.error('Session verification failed:', error);
      return false;
    }
  }

  async uploadImageToCloudinary(imageFile, username, onProgress) {
    try {
      const isSessionValid = await this.verifySession();
      if (!isSessionValid) {
        throw new Error('Session verification failed');
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'musify_image_preset'); // Make sure to create this preset in Cloudinary
      formData.append('folder', `musify/users/profile/${username}/`);

      const response = await axios.post(this.cloudinaryUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
          console.log('Upload progress:', percentCompleted + '%');
        }
      });

      if (response.status === 200) {
        console.log('Cloudinary upload successful:', {
          url: response.data.secure_url,
          publicId: response.data.public_id
        });
        return response.data;
      } else {
        throw new Error('Cloudinary upload failed');
      }
    } catch (error) {
      console.error('Error during Cloudinary upload:', error);
      throw error;
    }
  }
}