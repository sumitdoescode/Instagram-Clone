import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://instagram-clone-backend-a9xc.onrender.com/api/v1",
    withCredentials: true, // ✅ Cookie automatically jayegi
});

export default axiosInstance;
