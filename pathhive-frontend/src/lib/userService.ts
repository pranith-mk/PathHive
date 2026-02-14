import api from "./api"; // Your existing axios instance

export const userService = {
  updateProfile: async (data: { full_name: string; bio: string; avatar?: File | null }) => {
    
    // 1. Create a FormData object (Required for files)
    const formData = new FormData();
    formData.append("full_name", data.full_name || "");
    formData.append("bio", data.bio || "");

    // 2. Append file ONLY if it is a real File object
    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    }

    // 3. Send Request with 'multipart/form-data' header
    // We use 'transformRequest' to stop Axios from messing with the data
    const response = await api.patch("/auth/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data, headers) => {
        return data; // Return FormData as-is
      },
    });

    return response.data;
  },
};