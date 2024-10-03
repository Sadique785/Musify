import axiosInstance from './axios'; // Ensure the path is correct
import { store } from '../redux/auth/userStore';
import { refreshAccessToken, handleLogout, isTokenExpired } from '../Utils/tokenUtils';


axiosInstance.interceptors.response.use(

    response => response,
    async error => {
        console.log("reached here");
        const originalRequest = error.config;

        console.log('Interceptor triggered due to an error response.');
        console.log('Error details:', error);
        console.log('Original request:', originalRequest);

        // Check for 401 error (Unauthorized) and if this is the first retry
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            console.log('Handling 401 error and retry logic.');
            originalRequest._retry = true; 

            const state = store.getState(); 
            const { accessToken, refreshToken } = state.auth;
            console.log('Current state:', state);


            if (accessToken && isTokenExpired(accessToken)) {
                console.log('Access token is expired. Attempting to refresh it.');

                try {
                    const newAccessToken = await refreshAccessToken(refreshToken);

                    if (newAccessToken) {
                        console.log('Access token refreshed successfully. Retrying the original request.');
                        // originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        return axiosInstance(originalRequest);
                    } else {
                        console.error('Failed to refresh access token. Logging out.');
                        await handleLogout();
                        window.location.href = '/login'; 
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    console.error('Error during token refresh:', refreshError);
                    await handleLogout();
                    window.location.href = '/login'; 
                    return Promise.reject(refreshError);
                } 
            }else {
                console.warn('No access token found or token is not valid. Logging out.');
                await handleLogout();
                window.location.href = '/login'; 
                return Promise.reject(error);
            }


        }

    
        return Promise.reject(error);
    }
);

export default axiosInstance;
