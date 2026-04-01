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
