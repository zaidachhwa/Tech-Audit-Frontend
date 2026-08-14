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
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/student-login" && window.location.pathname !== "/teacher-login" && window.location.pathname !== "/admin-login") {
        window.location.href = "/student-login"; // fallback redirect
      }
    }
    return Promise.reject(error);
  }
);
