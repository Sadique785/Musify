import React, { useState, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import PostCardDropdown from './PostCardDropdown';
import axiosInstance from '../../../../axios/authInterceptor';
import toast from 'react-hot-toast';
function FollowButton({ userId, followStatus, updateFollowStatus , isSameUser, showDropdown = true, setIsDropdownOpen, isDropdownOpen, dropdownRef }) {
    const [followingStatus, setFollowingStatus] = useState(followStatus);
    console.log(followStatus,'the status is this')

    useEffect(() => {
        setFollowingStatus(followStatus);
    }, [followStatus]);
    const handleFollowToggle = async () => {
        try {
            let response;

            if (followingStatus === 'following') {
                response = await axiosInstance.delete(`/friends/follow/${userId}/`);
                setFollowingStatus('follow');
                updateFollowStatus(userId, 'follow'); 
            } else if (followingStatus === 'follow') {
                response = await axiosInstance.post(`/friends/follow/${userId}/`, {});
                setFollowingStatus('following');
                updateFollowStatus(userId, 'following'); 
            } else if (followingStatus === 'follow back') {
                response = await axiosInstance.post(`/friends/accept/${userId}/`, {});
                setFollowingStatus('unfollow');
                updateFollowStatus(userId, 'unfollow'); 
            } else if (followingStatus === 'unfollow') {
                response = await axiosInstance.post(`/friends/unfollow/${userId}/`, {});
                setFollowingStatus('follow back');
                updateFollowStatus(userId, 'follow back'); 
            }

            if (response && (response.status === 200 || response.status === 201)) {
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.error('Error following/unfollowing user:', error);
        }
    };

    const getButtonText = () => {
        switch (followingStatus) {
            case 'following':
                return 'Following';
            case 'follow':
                return 'Follow';
            case 'follow back':
                return 'Follow Back';
            case 'same_user':
                return null;
            case 'unfollow':
                    return 'Unfollow';
            default:
                return 'Follow';
        }
    };

    const buttonText = getButtonText();

    return (
        <div className="flex items-center space-x-2 mr-3 relative">
            {buttonText && (
                <button
                    onClick={handleFollowToggle}
                    className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-semibold font-mulish mr-2"
                >
                    {buttonText}
                </button>
            )}
            {showDropdown && (
                <div className="relative">
                    <FaEllipsisH
                        className="cursor-pointer text-gray-700"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    />
                    {isDropdownOpen && (
                        <PostCardDropdown
                            dropdownRef={dropdownRef}
                            isSameUser={isSameUser}
                            onDelete={() => console.log('Delete action triggered')}
                            onEdit={() => console.log('Edit action triggered')}
                            onCopyLink={() => console.log('Copy Link action triggered')}
                            onReport={() => console.log('Report action triggered')}
                            onSavePost={() => console.log('Save Post action triggered')}
                            onHidePost={() => console.log('Hide Post action triggered')}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default FollowButton;
