import axiosInstance from "@/utils/axios";

export const fetchWithToken = async (url, token) => {
    try {
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message || "Something went wrong" };
    }
};

export const postWithToken = async (url, data, token) => {
    try {
        const response = await axiosInstance.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message || "Something went wrong" };
    }
};

export const patchWithToken = async (url, data, token) => {
    try {
        const response = await axiosInstance.patch(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data?.message || error.message || "Something went wrong" };
    }
};

export const deleteWithToken = async (url, token) => {
    try {
        const response = await axiosInstance.delete(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, error: null };
    } catch (error) {
        console.log(error.response?.data?.message || error.message || "Something went wrong");
        return { data: null, error: error.response?.data?.message || error.message || "Something went wrong" };
    }
};
