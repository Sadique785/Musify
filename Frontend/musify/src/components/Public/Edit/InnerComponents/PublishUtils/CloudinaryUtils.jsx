import axiosInstance from "../../../../../axios/authInterceptor";
import axios from 'axios';
import { getConfig } from "../../../../../config";

export class CloudinaryUtils {
  constructor() {
    const { cloudinaryUrl: baseCloudinaryUrl } = getConfig(); // Dynamically get the Cloudinary URL
    this.cloudinaryUrl = `${baseCloudinaryUrl}/upload`; // Construct the upload URL
    // console.log('Using Cloudinary URL:', this.cloudinaryUrl); // Log the Cloudinary URL
  }
  

  async verifySession() {
    try {
      const response = await axiosInstance.get('/content/verify-user/');
      // console.log('Session verification successful');
      return true;
    } catch (error) {
      // console.error('Session verification failed:', error);
      return false;
    }
  }

  async uploadToCloudinary(file, projectName, username) {
    try {
      // First verify the session
      const isSessionValid = await this.verifySession();
      if (!isSessionValid) {
        throw new Error('Session verification failed');
      }

      // Prepare the file for upload
      const formData = new FormData();
      
      // Create a new File object with the correct name
      const mp3File = new File([file], `${projectName}.mp3`, { type: 'audio/mp3' });
      
      formData.append('file', mp3File);
      formData.append('upload_preset', 'musify_audio_preset');
      formData.append('folder', `musify/users/audio/${username}/`);

      // Upload to Cloudinary
      const response = await axios.post(this.cloudinaryUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // console.log('Upload progress:', percentCompleted + '%');
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
      // console.error('Error during Cloudinary upload:', error);
      throw error;
    }
  }
}
