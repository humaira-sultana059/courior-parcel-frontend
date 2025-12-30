const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiCall = async (method, endpoint, data = null) => {
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API Error");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
