// frontend/src/api.js
import axios from "axios";
import toast from "react-hot-toast";

// ❌ Remove localhost fallback completely
// ❌ Ensure API always uses Render URL

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("❌ VITE_API_URL is missing! API will not work.");
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// =========================
//  REQUEST INTERCEPTOR
// =========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
//  RESPONSE INTERCEPTOR
// =========================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => (window.location.href = "/login"), 600);
    }

    if (status === 403) {
      const msg =
        error.response?.data?.message ||
        "You are not allowed to perform this action.";

      toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export default api;
