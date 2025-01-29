import axiosInstance from "../../axios/authInterceptor";

export const handleLikeToggle = async ({
    postId,
    isLiked,
    setIsLiked,
    currentLikesCount,
    setCurrentLikesCount,
    setRecentLikes,
    currentUser,
    gatewayUrl,
}) => {
    try {
        // Store the original values to allow for rollback in case of error
        const originalIsLiked = isLiked;
        const originalLikesCount = currentLikesCount;
        
        // Toggle isLiked state immediately for a responsive UI (optimistic update)
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);

        // Adjust the likes count optimistically
        const updatedLikesCount = newIsLiked
            ? currentLikesCount + 1
            : Math.max(currentLikesCount - 1, 0); // Ensure the count does not go below zero
        setCurrentLikesCount(updatedLikesCount);

        // Update recent likes optimistically
        if (newIsLiked) {
            setRecentLikes((prevLikes) => [...prevLikes, currentUser.username]);
        } else {
            setRecentLikes((prevLikes) => prevLikes.filter((liker) => liker !== currentUser.username));
        }

        // Send the API request
        const response = await axiosInstance.post(
            `${gatewayUrl}/content/posts/${postId}/like/`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // API response handling
        if (response.data.message === 'Post liked') {
            setIsLiked(true);
            setCurrentLikesCount(originalLikesCount + 1);  // Confirm new count based on response
            setRecentLikes((prevLikes) => [...prevLikes, currentUser.username]);
        } else if (response.data.message === 'Post unliked') {
            setIsLiked(false);
            setCurrentLikesCount(Math.max(originalLikesCount - 1, 0));  // Confirm updated count
            setRecentLikes((prevLikes) => prevLikes.filter((liker) => liker !== currentUser.username));
        }

    } catch (error) {
        // console.error('Error toggling like:', error);

        // Rollback to the original state in case of API failure
        setIsLiked(originalIsLiked);
        setCurrentLikesCount(originalLikesCount);
        if (originalIsLiked) {
            setRecentLikes((prevLikes) => [...prevLikes, currentUser.username]);
        } else {
            setRecentLikes((prevLikes) => prevLikes.filter((liker) => liker !== currentUser.username));
        }
    }
};
