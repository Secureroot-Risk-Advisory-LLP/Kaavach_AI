import api from './api'

export const feedService = {
  getFeed: async (params = {}) => {
    const response = await api.get('/feed', { params })
    return response.data
  },
  
  createPost: async (data) => {
    const response = await api.post('/feed', data)
    return response.data
  },
  
  toggleLike: async (id) => {
    const response = await api.post(`/feed/${id}/like`)
    return response.data
  },
  
  addComment: async (id, text) => {
    const response = await api.post(`/feed/${id}/comment`, { text })
    return response.data
  },
  
  deletePost: async (id) => {
    const response = await api.delete(`/feed/${id}`)
    return response.data
  },
}

