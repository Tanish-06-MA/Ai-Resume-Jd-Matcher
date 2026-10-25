import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 120000
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/" && window.location.pathname !== "/signup") {
                window.location.assign("/");
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
