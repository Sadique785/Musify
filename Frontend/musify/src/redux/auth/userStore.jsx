import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './Slices/authSlice'; 
import contentReducer from './Slices/contentSlice'; 
import settingsReducer from './Slices/settingsSlice'; 
import audioReducer from './Slices/audioSlice';
import feedPostsReducer from './Slices/feedPostsSlice'



const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['feedPosts'] 
};

const rootReducer = combineReducers({
  auth: authReducer,
  content: contentReducer,
  settings: settingsReducer,
  audio: audioReducer,
  feedPosts: feedPostsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
