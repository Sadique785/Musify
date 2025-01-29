import axios from "axios";
import Cookies from 'js-cookie'
import { store } from "../redux/auth/userStore";
import { getConfig } from "../config";
import { getBackendUrl } from "../services/config";



// const backendUrl = import.meta.env.VITE_BACKEND_URL;
// const { backendUrl } = getConfig();
const backendUrl = getBackendUrl();


const axiosInstance = axios.create({
    baseURL: `${backendUrl}`,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    config => {
        const state = store.getState();
        const csrfTokenFromState = state.auth.csrfToken;

        const accessToken = state.auth.accessToken;
        const refreshToken = state.auth.refreshToken;



        const csrfToken = Cookies.get('csrftoken');

        // Correct the case of the CSRF token header
        if (csrfToken) {
            // console.log('CSRF token:', csrfToken);
            config.headers['X-CSRFToken'] = csrfToken;  // Correct header for CSRF
        } else {
            // console.warn('CSRF token missing!');
        }

        if (accessToken) {
            // console.log('Access token:', accessToken);
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
            // console.warn('Access token missing!');
        }

        if (refreshToken) {
            // console.log('Refresh token:', refreshToken);
            config.headers['X-Refresh-Token'] = refreshToken;
        }

        return config;

    }, error => {
        return Promise.reject(error);
    }
);





export default axiosInstance