import React, { useEffect, useState, useContext } from "react";
import { FaCamera, FaUser, FaTimes } from "react-icons/fa";
import axiosInstance from "../../../../axios/authInterceptor"; // Adjust the path as needed
import talents from "../../Elements/Talents";
import genres from "../../Elements/Genres";
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { updateUsername } from "../../../../redux/auth/Slices/authSlice";
import { ProfileContext } from "../../../../context/ProfileContext";

function RightProfile() {


    const backendUrl = import.meta.env.VITE_BACKEND_URL
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

    const dispatch = useDispatch()




    const handleTalentToggle = (talent) => {
        setProfile((prevProfile) => {
            console.log(prevProfile, 'before'); // Log the correct profile state before update
            
            const updatedTalents = prevProfile.talents.includes(talent)
                ? prevProfile.talents.filter((t) => t !== talent) // Remove if clicked again
                : [...prevProfile.talents, talent]; // Add if clicked first time
    
            console.log(updatedTalents, 'updated talents'); // Log updated talents array
            
            const newProfile = {
                ...prevProfile,
                talents: updatedTalents,
            };
    
            console.log(newProfile, 'profile after update'); // This will show the updated profile
    
            return newProfile;
        });
    };
    
    const handleGenreToggle = (genre) => {
        setProfile((prevProfile) => {
            console.log(prevProfile, 'before'); // Log the correct profile state before update
            
            const updatedGenres = prevProfile.genres.includes(genre)
                ? prevProfile.genres.filter((g) => g !== genre) // Remove if clicked again
                : [...prevProfile.genres, genre]; // Add if clicked first time
    
            console.log(updatedGenres, 'updated genres'); // Log updated genres array
            
            const newProfile = {
                ...prevProfile,
                genres: updatedGenres,
            };
    
            console.log(newProfile, 'profile after update'); // This will show the updated profile with new genres
    
            return newProfile;
        });
    };
    
    

    


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get("/auth/fetch-profile/");
                if (response.status === 200) {
                    console.log( 'Guys here is the data', response.data)
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
            const formData = new FormData();
            formData.append("image", selectedImage);

            try {
                const response = await axiosInstance.put("/auth/change-profile-image/", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.status === 200) {
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        imageUrl: response.data.image,
                    }));
                    setGlobalProfile((prevProfile) => ({
                        ...prevProfile,
                        imageUrl: response.data.image,
                    }))
                    setTimeout(() => {
                        toggleModal();
                    }, 100);
                }
            } catch (error) {
                console.error("Error updating profile image:", error);
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
        console.log(`Field Name: ${name}, Value: ${value}`); // This logs the name and new value of the field
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value, // Updates the specific field
        }));
    };
    

    useEffect(() => {
        console.log(profile, 'Updated Profile'); // Logs the latest state after update
    }, [profile]);
    

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


        console.log('Profile will update');

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
                console.log( 'these datas are coming back',response.data)

                

                console.log("profile updated");
                
                
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
            console.error("Error updating profile:", error);
            toast.error("An error occurred while updating your profile.");
        }

        
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Profile Settings</h1>

            {/* Profile Image Section */}
            <div className="flex items-start mb-4">
                <div className="relative w-1/4 h-[222px] mr-4">
                    <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        {profile.imageUrl ? (
                            <img
                                src={`${backendUrl}${profile.imageUrl}`}
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
                                        src={`${backendUrl}${profile.imageUrl}`}
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

                {/* Form Section */}
                <div className="flex flex-col w-3/4">
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

                    <div className="flex mb-7">
    <div className="w-1/4 mr-12">
        <label className="block text-gray-700 font-semibold mb-1">Gender</label>
        <div className="relative">
            <select
                name="gender" // Make sure this matches the key in your state
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

    <div className="w-2/4">
        <label className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
        <input
            type="date"
            name="date_of_birth" // Match this to the key in the state
            value={profile.date_of_birth || ""}
            onChange={handleFieldChange}
            className="w-full px-3 py-2 border rounded-lg"
        />
    </div>
</div>



                </div>
            </div>

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
