// frontend/src/services/extrasService.js
import api from "./api";

export const extrasService = {
  // Marketplace
  listMarketplace: (params) => api.get("/extras/marketplace", { params }),
  getMarketplaceItem: (id) => api.get(`/extras/marketplace/${id}`),
  createMarketplaceItem: (data) => api.post("/extras/marketplace", data),

  // Writeups
  listWriteups: (params) => api.get("/extras/writeups", { params }),
  getWriteup: (id) => api.get(`/extras/writeups/${id}`),
  createWriteup: (data) => api.post("/extras/writeups", data),

  // Jobs
  listJobs: (params) => api.get("/extras/jobs", { params }),
  getJob: (id) => api.get(`/extras/jobs/${id}`),
  createJob: (data) => api.post("/extras/jobs", data),

  // Knowledge Base
  listKB: (params) => api.get("/extras/kb", { params }),
  getKBArticle: (slug) => api.get(`/extras/kb/${slug}`),
  createKBArticle: (data) => api.post("/extras/kb", data),

  // Breach Alerts
  listBreachAlerts: () => api.get("/extras/breach-alerts"),
  createBreachAlert: (data) => api.post("/extras/breach-alerts", data),
};
