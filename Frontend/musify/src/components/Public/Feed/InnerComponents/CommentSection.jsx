import { FaUserCircle } from 'react-icons/fa';
const CommentSection = ({
  currentUser,
  comments,
  description,
  commentText,
  setCommentText,
  handleCommentSubmit,
  userImage
}) => {
  return (
    <div className="h-full flex flex-col justify-between overflow-hidden"> {/* Keep overflow hidden */}
      
      {/* Description at the top */}
      <div className="overflow-hidden">
        <div className="flex items-start mb-4">
          {userImage ? (
            <img src={userImage} alt="User" className="w-8 h-8 rounded-full object-cover mr-2" />
          ) : (
            <FaUserCircle className="w-8 h-8 text-gray-400 mr-2" />
          )}
          <div className="text-gray-700">
            <strong>Description:</strong>
            <p>{description}</p>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="flex-1 mb-4 overflow-y-auto no-scrollbar">
        <div className="flex flex-col">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start mb-4">
              <FaUserCircle className="w-8 h-8 text-gray-400 mr-2" />
              <div className="text-gray-700">
                <strong>{comment.user?.username || currentUser.username}</strong>
                <p>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment input */}
      <form onSubmit={handleCommentSubmit} className="flex items-center mt-4 w-full"> {/* Set width to full */}
        <input
          type="text"
          placeholder="Leave a comment..."
          className="flex-1 border rounded-lg p-2 mr-2 box-border" // Added box-border
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!commentText}
          className="bg-blue-600 text-white rounded-lg px-4 py-2" // Adjust padding as needed
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
