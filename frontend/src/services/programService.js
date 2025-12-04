import api from './api'

export const programService = {
  getPrograms: async (params = {}) => {
    const response = await api.get('/programs', { params })
    return response.data
  },
  
  getProgram: async (id) => {
    const response = await api.get(`/programs/${id}`)
    return response.data
  },
  
  createProgram: async (data) => {
    const response = await api.post('/programs', data)
    return response.data
  },
  
  updateProgram: async (id, data) => {
    const response = await api.put(`/programs/${id}`, data)
    return response.data
  },
  
  deleteProgram: async (id) => {
    const response = await api.delete(`/programs/${id}`)
    return response.data
  },
}

