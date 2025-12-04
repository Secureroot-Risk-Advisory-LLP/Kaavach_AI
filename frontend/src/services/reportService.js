import api from './api'

export const reportService = {

  // Submit a new bug report
  submitReport: async (formData) => {
    const res = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Hacker: List my reports
  getMyReports: async () => {
    const res = await api.get('/reports/my-reports');
    return res.data;
  },

  // Company: Get all reports submitted to this company
  getCompanyReports: async () => {
    const res = await api.get('/reports/company-reports');
    return res.data;
  },

  // Get a single report
  getReport: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  // Company: Update status + reward + reviewNotes
  // Returns: { message, report, xpAwarded }
  updateReportStatus: async (id, data) => {
    const res = await api.put(`/reports/${id}/status`, data);
    return res.data;  // ⭐ includes xpAwarded if accepted
  },
};
