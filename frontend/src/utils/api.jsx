import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

console.log('API Base URL:', import.meta.env.VITE_API_URL);

export default api;