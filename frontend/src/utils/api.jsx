import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "/api").trim();

console.log("Using API URL:", baseURL);

const api = axios.create({
  baseURL,
  timeout: 20000,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
