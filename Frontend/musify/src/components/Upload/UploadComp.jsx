import React, { useState } from 'react';
import axios from 'axios';


const UploadComponent = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        const fileType = file.type.startsWith('image/') ? 'image' : 'video';

        const uploadPreset = fileType === 'image' ? 'musify_image_preset' :'musify_video_preset';

        formData.append('upload_preset', uploadPreset)

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dyjxawldh${fileType}/upload`,
                formData
            );
            setUrl(response.data.secure_url);
            
        } catch (error) {
            console.error(`Error uploading ${fileType}:`, error);
        } finally {
            setIsUploading(false);
        }
    };


    return(
        <div>
            <h2>Upload Image or Video</h2>
            <input type="file" accept='image/*,video/*' onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>

            {url && (
                <div>
                    {file.type.startsWith('video/') ? (
                        <video src={url} controls width='400' />

                    ):(
                        <img src={url} alt="Uploaded" width='400' />
                    )
                    }
                </div>
                )}
        </div>
    );

};

export default UploadComponent;