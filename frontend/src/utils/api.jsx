import axios from 'axios';

// Create an Axios instance for API requests with a base URL.
// The base URL is retrieved from environment variables or defaults to localhost.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5452/api',
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
