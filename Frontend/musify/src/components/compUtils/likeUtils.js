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
        // Toggle isLiked state immediately for a responsive UI
        setIsLiked(!isLiked);

        const response = await axiosInstance.post(
            `${gatewayUrl}/content/posts/${postId}/like/`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data.message === 'Post liked') {
            setIsLiked(true);
            setCurrentLikesCount(currentLikesCount + 1);
            setRecentLikes(prevLikes => [...prevLikes, currentUser.username]);
        } else if (response.data.message === 'Post unliked') {
            setIsLiked(false);
            setCurrentLikesCount(Math.max(currentLikesCount - 1, 0)); // Ensure the count does not go below zero
            setRecentLikes(prevLikes => prevLikes.filter(liker => liker !== currentUser.username));
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
};