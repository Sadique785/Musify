import {jwtDecode} from 'jwt-decode';
import axiosInstance from '../axios/axios'; // Make sure the path is correct
import { store } from '../redux/auth/userStore';
import { loginSuccess, logout } from '../redux/auth/Slices/authSlice';
import { persistor } from '../redux/auth/userStore';



// Function to decode a JWT token
export const decodeToken = (token) => {
    try {
        
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};


// Function to check if a token is expired
export const isTokenExpired = (token) => {
    const decodedToken = decodeToken(token);
    if (!decodedToken) return true;

    const currentTime = Date.now() / 1000; // Get current time in seconds
    return decodedToken.exp < currentTime;
};


export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken || isTokenExpired(refreshToken)) {
        return null;
    }

    try {
        const response = await axiosInstance.post('/auth/refresh_access_token/', { refresh: refreshToken });
        if (response.status === 200) {
            const newAccessToken = response.data.access;
            const newRefreshToken = response.data.refresh;
            const decodedAccessToken = decodeToken(newAccessToken);

            // Update Redux store with new tokens
            store.dispatch(
                loginSuccess({
                    user: { name: decodedAccessToken.username },
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                })
            );

            return newAccessToken;
        }

    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}


// export const handleLogout = async () => {
//     try {
//         await axiosInstance.post('/auth/logout/');
//     } catch (error) {
//         console.error('Error logging out:', error);
//     } finally {
//         store.dispatch(logout());
//         await persistor.purge();
//     }
// };

export const handleLogout = async () => {
    try {
        // Send the logout request to the backend
        const response = await axiosInstance.post('/auth/logout/');

        if (response.status === 200) {
            store.dispatch(logout());
            await persistor.purge();
        } else {
            console.error('Logout failed on the backend. Status:', response.status);
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};
