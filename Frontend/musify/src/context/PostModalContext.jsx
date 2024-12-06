import React, { createContext, useState, useContext } from 'react';
import ModalPortal from '../components/Public/navbars/InnerComp.jsx/Notification/ModalPortal';
import StandalonePostDetail from '../components/Public/Feed/InnerComponents/StandalonePostDetail';
const PostModalContext = createContext({
  openPostModal: () => {},
  closePostModal: () => {},
});

export const PostModalProvider = ({ children }) => {
  const [postId, setPostId] = useState(null);

  const openPostModal = (id) => {
    setPostId(id);
  };

  const closePostModal = () => {
    setPostId(null);
  };

  return (
    <PostModalContext.Provider value={{ openPostModal, closePostModal }}>
      {children}
      {postId && (
        <ModalPortal onClose={closePostModal}>
          <StandalonePostDetail 
            postId={postId} 
            onClose={closePostModal} 
          />
        </ModalPortal>
      )}
    </PostModalContext.Provider>
  );
};

export const usePostModal = () => useContext(PostModalContext);