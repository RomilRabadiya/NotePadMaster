// Import Axios for making HTTP requests
import axios from "axios";

// Create an Axios instance with a default base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Backend URL
});

// Add an Axios request interceptor
API.interceptors.request.use(
  (req) => {
    
    // Get token from localStorage (if available)
    const token = localStorage.getItem("token");

    // If token exists, attach it to the Authorization header
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Export the Axios instance so we can use it in components
export default API;
