import api from './api'

export const adminService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },
  
  approveCompany: async (id, isApproved) => {
    const response = await api.put(`/admin/users/${id}/approve`, { isApproved })
    return response.data
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },
  
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },
}

