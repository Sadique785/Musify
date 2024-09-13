import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSettings } from '../../../redux/auth/Slices/settingsSlice';
import { FaUser, FaCog, FaUserFriends, FaBell, FaLock, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../../redux/auth/Slices/authSlice';
import axiosInstance     from '../../../axios/axios';
import {useNavigate} from 'react-router-dom'
import { persistor } from '../../../redux/auth/userStore';



function SettingsLeft() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const selectedSettings = useSelector((state) => state.settings.selectedSettings);

    const handleSettingsChange = (settings) => {
        dispatch(setSelectedSettings(settings));
    };

    const handleLogout = async () => {
        try{

            const response = await axiosInstance.post('/auth/logout/');
            if (response.status == 200) {
                dispatch(logout);
                console.log('logout successfull')

                await persistor.purge();
                console.log('persistor cleared');

                navigate('/login')


                
            } else {
                console.error('Logout failed', response.data);
                
            }

        } catch(error){
            console.error('An error occured during logout: ', error);
            

        }

        console.log('Logout triggered');
    };

    const buttonClass = "flex items-center space-x-3 p-2 mb-2 rounded-lg transition";

    return (
        <div className='p-4 ml-20'>
            {/* Profile Section */}
            <div className="flex items-center mb-4">
                <div className="bg-gray-300 p-2 rounded-full">
                    <FaUser className="text-gray-700 text-xl" />
                </div>
                <div className="ml-3">
                    <h3 className="font-bold text-gray-600">Username</h3>
                    <p className="text-xs text-gray-600 cursor-pointer">Go back to profile</p>
                </div>
            </div>

            {/* Options Section */}
            <button
                onClick={() => handleSettingsChange('profile')}
                className={`${buttonClass} ${selectedSettings === 'profile' ? 'bg-gray-200 w-60 font-extrabold' : 'hover:bg-gray-200 w-60'}`}
            >
                <div className="bg-blue-200 p-2 rounded-lg"> {/* Background color for the icon */}
                    <FaUser className="text-blue-600" /> {/* Icon color */}
                </div>
                <span className='font-bold text-sm text-gray-600'>Profile</span>
            </button>

            <button
                onClick={() => handleSettingsChange('account')}
                className={`${buttonClass} ${selectedSettings === 'account' ? 'bg-gray-200 w-60 font-extrabold' : 'hover:bg-gray-200 w-60'}`}
            >
                <div className="bg-yellow-200 p-2 rounded-lg"> {/* Background color for the icon */}
                    <FaCog className="text-yellow-600" /> {/* Icon color */}
                </div>
                <span className='font-bold text-sm text-gray-600'>Account</span>
            </button>

            <button
                onClick={() => handleSettingsChange('collaborations')}
                className={`${buttonClass} ${selectedSettings === 'collaborations' ? 'bg-gray-200 w-60 font-extrabold' : 'hover:bg-gray-200 w-60'}`}
            >
                <div className="bg-purple-200 p-2 rounded-lg"> {/* Background color for the icon */}
                    <FaUserFriends className="text-purple-600" /> {/* Icon color */}
                </div>
                <span className='font-bold text-sm text-gray-600'>Collaborations</span>
            </button>

            <button
                onClick={() => handleSettingsChange('notifications')}
                className={`${buttonClass} ${selectedSettings === 'notifications' ? 'bg-gray-200 w-60 font-extrabold' : 'hover:bg-gray-200 w-60'}`}
            >
                <div className="bg-green-200 p-2 rounded-lg"> {/* Background color for the icon */}
                    <FaBell className="text-green-600" /> {/* Icon color */}
                </div>
                <span className='font-bold text-sm text-gray-600'>Notifications</span>
            </button>

            <button
                onClick={() => handleSettingsChange('privacy')}
                className={`${buttonClass} ${selectedSettings === 'privacy' ? 'bg-gray-200 w-60 font-extrabold' : 'hover:bg-gray-200 w-60'}`}
            >
                <div className="bg-red-200 p-2 rounded-lg"> {/* Background color for the icon */}
                    <FaLock className="text-red-600" /> {/* Icon color */}
                </div>
                <span className='font-bold text-sm text-gray-600'>Privacy</span>
            </button>


            <button
                onClick={handleLogout}
                className={`${buttonClass}  text-white font-bold hover:bg-gray-200 w-60`}
            >
                <div className="bg-red-200 p-2 rounded-lg">
                    <FaSignOutAlt className="text-red-600" />
                </div>
                <span className='text-sm text-gray-600'>Logout</span>
            </button>
        </div>
    );
}

export default SettingsLeft;