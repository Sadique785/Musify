import axiosInstance from "../../../../../axios/authInterceptor";

export class DatabaseUtils {
  async saveProjectToDatabase({
    fileUrl,
    publicId,
    projectName,
    username,
    description,
    genre,
    folder
  }) {
    try {
      const saveResponse = await axiosInstance.post('/content/save-upload/', {
        file_url: fileUrl,
        file_type: 'audio',
        folder: folder,
        username: username,
        description: description,
        content_source: 'EDITED_AUDIO', // Specify this is an edited audio project
        project_name: projectName,
        genre: genre,
        public_id: publicId
      });

      if (saveResponse.status === 200) {
        console.log('Project saved successfully to database');
        return saveResponse.data;
      } else {
        throw new Error('Failed to save project to database');
      }
    } catch (error) {
      console.error('Error saving project to database:', error);
      throw error;
    }
  }

  async deleteFromCloudinary(publicId) {
    try {
      const response = await axiosInstance.post('/content/delete-cloudinary/', {
        public_id: publicId
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  }
}