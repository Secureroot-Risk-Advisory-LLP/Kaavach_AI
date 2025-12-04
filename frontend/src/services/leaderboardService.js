import api from './api'

export const leaderboardService = {
  // ------- OLD FUNCTIONS (KEEP THESE) -------
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard')
    return response.data
  },

  getMyStats: async () => {
    const response = await api.get('/leaderboard/my-stats')
    return response.data
  },

  // ------- NEW ADVANCED LEADERBOARD ENDPOINTS -------

  // Global leaderboard (XP-based ranking)
  getGlobalLeaderboard: async () => {
    const response = await api.get('/analytics/leaderboard/global')
    return response.data
  },

  // Seasonal leaderboard (last 3 months rewards)
  getSeasonalLeaderboard: async () => {
    const response = await api.get('/analytics/leaderboard/seasonal')
    return response.data
  },

  // Country leaderboard
  getCountryLeaderboard: async (country) => {
    const response = await api.get(`/analytics/leaderboard/country/${country}`)
    return response.data
  },
}
