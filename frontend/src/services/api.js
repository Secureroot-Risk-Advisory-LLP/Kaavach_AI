// frontend/src/api.js
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    const user = localStorage.getItem("user");

    // Debug only (does NOT break anything)
    console.debug("[API] → Request:", config.method?.toUpperCase(), config.url);
    console.debug("[API] → Token exists?", !!token);

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

    // 401: Unauthorized → token invalid
    if (status === 401) {
      toast.error("Session expired. Please log in again.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setTimeout(() => {
        window.location.href = "/login";
      }, 600);

      return Promise.reject(error);
    }

    // 403: Forbidden → user role / approval issue
    if (status === 403) {
      const msg =
        error.response?.data?.message ||
        "You are not allowed to perform this action.";

      toast.error(msg);

      // Debug — shows EXACT reason from backend
      console.warn("[API] 403 Forbidden → Details:", {
        url: error.config?.url,
        method: error.config?.method,
        serverMessage: error.response?.data,
        user: (() => {
          try { return JSON.parse(localStorage.getItem("user")); }
          catch { return null; }
        })(),
        tokenPresent: !!localStorage.getItem("token")
      });
    }

    // General API errors
    return Promise.reject(error);
  }
);

export default api;
