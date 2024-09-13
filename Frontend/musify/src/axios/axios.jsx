import axios from "axios";
import Cookies from 'js-cookie'


const backendUrl = import.meta.env.VITE_BACKEND_URL;
const axiosInstance = axios.create({
    baseURL: `${backendUrl}`,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    config => {
        const csrfToken = Cookies.get('csrftoken');
        if (csrfToken){
            console.log('this is our csrf', csrfToken);
            config.headers['X-CSRFToken'] = csrfToken;
            
        }
    return config;
}, error =>{
    return Promise.reject(error);
});




export default axiosInstance