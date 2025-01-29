import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App.jsx'
import './index.css'
import { store, persistor } from './redux/auth/userStore.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  // Explicit null check to disable StrictMode
  null || (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider clientId='810625556205-ldrdf6gani3826dqaddg7518o68mvbur.apps.googleusercontent.com'>
          <App />
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  )
)