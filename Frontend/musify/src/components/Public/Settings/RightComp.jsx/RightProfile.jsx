import React, { useEffect, useState, useContext } from "react";
import { FaCamera, FaUser, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../axios/authInterceptor"; // Adjust the path as needed
import talents from "../../Elements/Talents";
import genres from "../../Elements/Genres";
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { updateUsername } from "../../../../redux/auth/Slices/authSlice";
import { ProfileContext } from "../../../../context/ProfileContext";
import { getBackendUrl } from "../../../../services/config";
import { CloudinaryImageUtils } from "../../Feed/utils/CloudinaryImageUtils";
import LoadingModal from "../../Feed/utils/LoadingModal";

function RightProfile() {

    const backendUrl = getBackendUrl();
    const {setProfile: setGlobalProfile} = useContext(ProfileContext)
    const [profile, setProfile] = useState({
        username: "",
        imageUrl: "",
        location: "",
        gender: "",
        date_of_birth: "",
        talents: [], 
        genres: [],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedTalents, setSelectedTalents] = useState([]);
    const [initialProfile, setInitialProfile] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [uploadState, setUploadState] = useState({
        isLoading: false,
        currentStep: null,
        uploadProgress: 0
    });
    const loggedInUsername = useSelector((state) => state.auth.user?.username);


    const dispatch = useDispatch()




    const handleTalentToggle = (talent) => {
        setProfile((prevProfile) => {
            
            const updatedTalents = prevProfile.talents.includes(talent)
                ? prevProfile.talents.filter((t) => t !== talent) // Remove if clicked again
                : [...prevProfile.talents, talent]; // Add if clicked first time
    
            
            const newProfile = {
                ...prevProfile,
                talents: updatedTalents,
            };
    
    
            return newProfile;
        });
    };
    
    const handleGenreToggle = (genre) => {
        setProfile((prevProfile) => {
            
            const updatedGenres = prevProfile.genres.includes(genre)
                ? prevProfile.genres.filter((g) => g !== genre) // Remove if clicked again
                : [...prevProfile.genres, genre]; // Add if clicked first time
    
            
            const newProfile = {
                ...prevProfile,
                genres: updatedGenres,
            };
    
    
            return newProfile;
        });
    };
    
    

    


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get("/auth/fetch-profile/");
                if (response.status === 200) {
                    setProfile({
                        username: response.data.username,
                        imageUrl: response.data.image_url,
                        location: response.data.location,
                        gender: response.data.gender,
                        date_of_birth: response.data.date_of_birth,
                        talents: response.data.talents || [], 
                        genres: response.data.genres || [], 
                    });
                    setInitialProfile({
                        username: response.data.username,
                        imageUrl: response.data.image_url,
                        location: response.data.location,
                        gender: response.data.gender,
                        date_of_birth: response.data.date_of_birth,
                        talents: response.data.talents || [], 
                        genres: response.data.genres || [], 
                    });
                }
            } catch (error) {
                console.error("Error Fetching the Details", error);
            }
        };
        fetchProfile();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };


    const handleSaveImage = async () => {
        
        if (selectedImage) {
            try {
                setUploadState({
                    isLoading: true,
                    currentStep: 'verify',
                    uploadProgress: 0
                });
    
                const cloudinaryUtils = new CloudinaryImageUtils();
                
                await cloudinaryUtils.verifySession();
                
                setUploadState(prev => ({
                    ...prev,
                    currentStep: 'upload'
                }));
    
                const cloudinaryResponse = await cloudinaryUtils.uploadImageToCloudinary(
                    selectedImage,
                    loggedInUsername,
                    (progress) => {
                        setUploadState(prev => ({
                            ...prev,
                            uploadProgress: progress
                        }));
                    }
                );
    
                setUploadState(prev => ({
                    ...prev,
                    currentStep: 'save',
                    uploadProgress: 100
                }));
    
                const response = await axiosInstance.put("/auth/change-profile-image/", {
                    image_url: cloudinaryResponse.secure_url
                });
    
                if (response.status === 200) {
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        imageUrl: response.data.image_url,
                    }));
                    
                    setGlobalProfile((prevProfile) => ({
                        ...prevProfile,
                        imageUrl: response.data.image_url,
                    }));
    
                    toast.success('Profile image updated successfully');
                    
                    setUploadState(prev => ({ ...prev, isLoading: false }));
                    setTimeout(() => {
                        toggleModal();
                    }, 100);
                }
            } catch (error) {
                toast.error('Failed to update profile image');
                setUploadState(prev => ({ ...prev, isLoading: false }));
            }
        }
    };


    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value, // Updates the specific field
        }));
    };
    

    

    const hasChanges = () => {
        return (
            JSON.stringify(profile) !== JSON.stringify(initialProfile) || 
            JSON.stringify(profile.talents) !== JSON.stringify(initialProfile.talents) || 
            JSON.stringify(profile.genres) !== JSON.stringify(initialProfile.genres) 
        );
    };




    const handleProfileUpdate = async () => {

        if (!profile.username.trim()) {
            toast.error("Username is required.");
            return;
        }



        const updatedProfileData = {
            username: profile.username,
            location: profile.location,
            date_of_birth: profile.date_of_birth,
            gender: profile.gender,
            talents: profile.talents, // Use profile.talents
            genres: profile.genres,   
            
          };
          try {
            const response = await axiosInstance.put("/auth/edit-profile/", updatedProfileData);

            if (response.status === 200) {

                

                
                
                toast.success("Profile updated successfully!");


                setProfile((prevProfile) => ({
                    ...prevProfile,
                    ...updatedProfileData,
                }));
                setGlobalProfile((prevProfile) => ({
                    ...prevProfile,
                    username:updatedProfileData.username,
                }))

                dispatch(updateUsername({username: profile.username}));
                
            } else {
                // Show error toast
                toast.error("Failed to update profile. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred while updating your profile.");
        }

        
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Profile Settings</h1>
    
            {/* Main Profile Section - Flex container that changes direction on mobile */}
            <div className="flex flex-col md:flex-row items-start mb-4">
                {/* Profile Image Section - Full width on mobile, 1/4 width on md and up */}
                <div className="w-full md:w-1/4 mb-6 md:mb-0 md:mr-4">
                    {/* Wrapper to maintain aspect ratio */}
                    <div className="relative pt-[100%] w-full max-w-[222px] mx-auto">
                        {/* Image container with absolute positioning to maintain roundness */}
                        <div className="absolute inset-0">
                            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                {profile.imageUrl ? (
                                    <img
                                        src={`${profile.imageUrl}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUser className="text-gray-500 text-6xl" />
                                )}
                            </div>
                            <div
                                className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                onClick={toggleModal}
                            >
                                <FaCamera className="text-white text-xl" />
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* Form Section - Full width on mobile, 3/4 width on md and up */}
                <div className="w-full md:w-3/4">
                    <div className="mb-7">
                        <label className="block text-gray-700 font-semibold mb-1">Name</label>
                        <input
                            type="text"
                            name="username"
                            value={profile.username || ""}
                            onChange={(e) => handleFieldChange(e)}
                            placeholder="Enter your name"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
    
                    <div className="mb-7">
                        <label className="block text-gray-700 font-semibold mb-1">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={profile.location || ""}
                            onChange={(e) => handleFieldChange(e)}
                            placeholder="Enter your location"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
    
                    <div className="flex flex-col md:flex-row mb-7 gap-4">
                        <div className="w-full md:w-1/4">
                            <label className="block text-gray-700 font-semibold mb-1">Gender</label>
                            <div className="relative">
                                <select
                                    name="gender"
                                    value={profile.gender || ""}
                                    onChange={handleFieldChange}
                                    className="w-full px-3 py-2 border rounded-full appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <svg
                                    className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6.293 7.293a1 1 0 011.414 0L10 8.586l2.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
    
                        <div className="w-full md:w-2/4">
                            <label className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={profile.date_of_birth || ""}
                                onChange={handleFieldChange}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
    
            {/* Image Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative w-[300px]">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            onClick={toggleModal}
                        >
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-lg font-semibold text-center mb-4">Profile Image</h2>
                        <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Selected Preview" className="w-full h-full object-cover" />
                            ) : profile.imageUrl ? (
                                <img
                                    src={`${profile.imageUrl}`}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser className="text-gray-500 text-6xl" />
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="file-input"
                        />
                        <label
                            htmlFor="file-input"
                            className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727] w-full cursor-pointer"
                        >
                            <FaCamera className="mr-2" />
                            Replace Image
                        </label>
                        {selectedImage && (
                            <button
                                className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727] w-full"
                                onClick={handleSaveImage}
                            >
                                Save
                            </button>
                        )}
                    </div>
                </div>
            )}
    
            <LoadingModal 
                isOpen={uploadState.isLoading}
                currentStep={uploadState.currentStep}
                uploadProgress={uploadState.uploadProgress}
            />
    
            <div className="mt-10">
                <h1 className="text-2xl font-semibold mb-4">Music Interests</h1>
                
                {/* Talents Section */}
                <h2 className="text-lg font-semibold mb-3">Talents</h2>
                <div className="flex flex-wrap gap-4">
                    {talents.map((talent) => (
                        <div
                            key={talent.id}
                            onClick={() => handleTalentToggle(talent.name)}
                            className={`flex items-center cursor-pointer rounded-full px-3 py-1 text-sm font-bold ${
                                profile.talents.includes(talent.name)
                                    ? 'bg-black text-white'
                                    : 'bg-gray-200 text-black'
                            }`}
                        >
                            <div className="mr-2">{talent.icon}</div>
                            <span>{talent.name}</span>
                        </div>
                    ))}
                </div>
    
                {/* Favorite Genres Section */}
                <h2 className="text-lg font-semibold mt-9 mb-6">Favorite Genres</h2>
                <div className="flex flex-wrap gap-4">
                    {genres.map((genre) => (
                        <div
                            key={genre.id}
                            onClick={() => handleGenreToggle(genre.name)}
                            className={`flex items-center cursor-pointer rounded-full px-3 py-1 text-sm font-bold ${
                                profile.genres.includes(genre.name)
                                    ? 'bg-black text-white'
                                    : 'bg-gray-200 text-black'
                            }`}
                        >
                            <div className="mr-2">{genre.icon}</div>
                            <span>{genre.name}</span>
                        </div>
                    ))}
                </div>
            </div>
    
            <button
                onClick={handleProfileUpdate}
                className={`mt-6 px-6 py-2 font-semibold rounded-lg ${
                    hasChanges()
                        ? 'bg-blue-500 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!hasChanges()}
            >
                Update
            </button>
    
            <Toaster />
        </div>
    );
}

export default RightProfile;
