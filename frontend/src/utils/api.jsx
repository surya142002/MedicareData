import axios from 'axios';

console.log("Using API URL:", import.meta.env.VITE_API_URL); // Debugging log
// Create an Axios instance for API requests with a base URL.
// The base URL is retrieved from environment variables or defaults to localhost.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://medicare-backend-ced189f0c65c.herokuapp.com/api",
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    // check token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export axios instance
export default api;
