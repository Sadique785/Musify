import React from 'react';

function PostCardDropdown({ dropdownRef, isSameUser, onDelete, onEdit, onCopyLink, onReport, onSavePost, onHidePost }) {
    return (
        <div ref={dropdownRef} className="absolute bg-gray-200 shadow-lg rounded-md p-2 w-48 z-50 -left-48 top-3">
            <ul>
                {isSameUser ? (
                    <>
                        <li 
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={onDelete}
                        >
                            Delete
                        </li>
                        <li 
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={onEdit}
                        >
                            Edit
                        </li>
                        <li 
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={onCopyLink}
                        >
                            Copy Link
                        </li>
                    </>
                ) : (
                    <>
                        <li 
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={onReport}
                        >
                            Report
                        </li>
                        <li 
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={onSavePost}
                        >
                            Save Post
                        </li>
                    </>
                )}
                <li 
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                    onClick={onHidePost}
                >
                    Hide Post
                </li>
            </ul>
        </div>
    );
}

export default PostCardDropdown;
