import { useState, useEffect } from 'react'
import { leaderboardService } from '../services/leaderboardService'
import { Trophy, Medal, Crown, Award, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [country, setCountry] = useState('india')

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab, country])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)

      let result
      if (activeTab === 'global') {
        result = await leaderboardService.getGlobalLeaderboard()
      } else if (activeTab === 'seasonal') {
        result = await leaderboardService.getSeasonalLeaderboard()
      } else {
        result = await leaderboardService.getCountryLeaderboard(country)
      }

      setData(result || [])
    } catch (error) {
      toast.error('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return <span className="text-gray-500 font-bold">#{rank}</span>
  }

  const getRankColor = (rank) => {
    if (rank === 1)
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    if (rank === 2)
      return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    if (rank === 3)
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare top researchers globally, seasonally, or by country
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        {['global', 'seasonal', 'country'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Country Selector */}
      {activeTab === 'country' && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <Globe className="h-5 w-5 text-primary-600" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field w-48"
            >
              <option value="india">India</option>
              <option value="usa">USA</option>
              <option value="uk">UK</option>
              <option value="germany">Germany</option>
              <option value="france">France</option>
              <option value="australia">Australia</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Rank
                  </th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Hacker
                  </th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Points
                  </th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Badges
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.map((h, index) => {
                  const rank = index + 1
                  return (
                    <tr
                      key={h._id}
                      className={`${getRankColor(rank)} border-b border-gray-200 dark:border-gray-700`}
                    >
                      <td className="py-4 px-4">{getRankIcon(rank)}</td>

                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="font-semibold text-primary-700 dark:text-primary-300">
                              {h.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {h.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {h.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary-600" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {h.points || 0}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {h.badges?.length > 0 ? (
                            h.badges.map((badge, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs rounded bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                              >
                                {badge}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No badges</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
