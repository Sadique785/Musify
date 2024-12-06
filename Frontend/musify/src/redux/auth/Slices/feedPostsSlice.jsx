// feedPostsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trendingPosts: [],
  hasMore: true,
  currentPage: 1,
  isLoading: false,
  isPaginationLoading: false, // Add new state for pagination loading
  error: '',
  lastFetchTime: null
};

const feedPostsSlice = createSlice({
  name: 'feedPosts',
  initialState,
  reducers: {
    setTrendingPosts: (state, action) => {
      const { posts, isInitial } = action.payload;
      if (isInitial) {
        state.trendingPosts = posts;
      } else {
        state.trendingPosts = [...state.trendingPosts, ...posts];
      }
      state.lastFetchTime = Date.now();
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setPaginationLoading: (state, action) => { // Add new action
      state.isPaginationLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateFollowStatusInStore: (state, action) => {
      const { userId, status } = action.payload;
      state.trendingPosts = state.trendingPosts.map(post => {
        if (post.user_id === userId) {
          return { ...post, follow_status: status };
        }
        return post;
      });
    },
    clearFeedData: (state) => {
      state.trendingPosts = [];
      state.hasMore = true;
      state.currentPage = 1;
      state.isLoading = false;
      state.isPaginationLoading = false;
      state.error = '';
      state.lastFetchTime = null;
    }
  }
});

export const {
  setTrendingPosts,
  setHasMore,
  setCurrentPage,
  setLoading,
  setPaginationLoading,
  setError,
  updateFollowStatusInStore,
  clearFeedData
} = feedPostsSlice.actions;

export default feedPostsSlice.reducer;