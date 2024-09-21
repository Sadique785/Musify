import axiosInstance from './axios'; // Ensure the path is correct
import { store } from '../redux/auth/userStore';
import { refreshAccessToken, handleLogout, isTokenExpired } from '../Utils/tokenUtils';

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Check for 401 error (Unauthorized)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const state = store.getState();
            const { accessToken, refreshToken } = state.auth;

            if (accessToken && isTokenExpired(accessToken)) {
                try {
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    if (newAccessToken) {
                        return axiosInstance(originalRequest);
                    } else {
                        // Token refresh failed, redirect to the appropriate login page
                        await handleLogout();
                        if (originalRequest.url.includes('/admin-')) {
                            window.location.href = '/admin/login'; // Admin redirect
                        } else {
                            window.location.href = '/login'; // User redirect
                        }
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    await handleLogout();
                    if (originalRequest.url.includes('/admin-')) {
                        window.location.href = '/admin/login'; // Admin redirect
                    } else {
                        window.location.href = '/login'; // User redirect
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                await handleLogout();
                if (originalRequest.url.includes('/admin-')) {
                    window.location.href = '/admin/login'; // Admin redirect
                } else {
                    window.location.href = '/login'; // User redirect
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
