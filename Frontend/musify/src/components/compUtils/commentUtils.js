import axiosInstance from "../../axios/authInterceptor";
import toast from "react-hot-toast";

export const handleCommentSubmit = async ({
    postId,
    commentText,
    setCommentText,
    setComments,
    setCommentCount,
    gatewayUrl,
    currentUser,
    comments,
}) => {
    const tempId = `temp-${Date.now()}`; // Temporary ID for optimistic update

const optimisticComment = {
    id: tempId, 
    user: {
        id: currentUser.id, // User ID
        username: currentUser.username, // Username
    },
    text: commentText,
    created_at: new Date().toISOString(), 
};






    try {
        setComments((prevComments) => [optimisticComment, ...prevComments]);
        setCommentText(''); // Clear the comment input field
        setCommentCount((prevCount) => prevCount + 1); // Update the comment count

        // API call to save the comment
        const response = await axiosInstance.post(
            `${gatewayUrl}/content/posts/${postId}/comment/`,
            { content: commentText },
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 201) {
            toast.success('Comment added successfully');
            


        }
    } catch (error) {
        // Rollback: Remove the optimistic comment if the request fails
        setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== tempId)
        );
        setCommentCount((prevCount) => prevCount - 1); // Revert the comment count

        toast.error('Failed to add comment');
        console.error('Error submitting comment:', error);
    }
};
