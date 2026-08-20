import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");

  if (token) {
    // 🔥 handle JSON stored token
    try {
      token = JSON.parse(token);
    } catch { }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === "/login";

      if (!isLoginPage) {
        // Clear expired auth session
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
