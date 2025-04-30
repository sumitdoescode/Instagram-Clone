import axiosInstance from "@/utils/axios";

export const fetchWithToken = async (url, token) => {
    const response = await axiosInstance.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const postWithToken = async (url, data, token) => {
    const response = await axiosInstance.post(url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const patchWithToken = async (url, data, token) => {
    const response = await axiosInstance.patch(url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteWithToken = async (url, token) => {
    const response = await axiosInstance.delete(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
