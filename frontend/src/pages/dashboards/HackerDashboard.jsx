import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { programService } from '../../services/programService'
import { reportService } from '../../services/reportService'
import { leaderboardService } from '../../services/leaderboardService'
import { analyticsService } from '../../services/analyticsService'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Bug, FileText, Trophy, Award, Plus, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

// UI components
import StatsCard from '../../components/ui/StatsCard'
import BadgeList from '../../components/ui/BadgeList'
import LevelProgress from '../../components/ui/LevelProgress'
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'] // critical, high, medium, low

const HackerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  
  const [stats, setStats] = useState(null)
  const [programs, setPrograms] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  // NEW ANALYTICS STATES
  const [severityData, setSeverityData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [acceptStats, setAcceptStats] = useState([])
  const [impact, setImpact] = useState({ impactScore: 0 })

  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitData, setSubmitData] = useState({
    program: '',
    title: '',
    description: '',
    severity: 'low',
    file: null,
  })

  useEffect(() => {
    if (user) fetchAll()
  }, [user])

  const fetchAll = async () => {
    try {
      setLoading(true)
      
      // Dashboard + Analytics
      const [
        statsData,
        programsData,
        reportsData,
        sev,
        mon,
        acc,
        imp
      ] = await Promise.all([
        leaderboardService.getMyStats(),
        programService.getPrograms({ status: 'active', limit: 5, page: 1 }),
        reportService.getMyReports(),

        analyticsService.getSeverityStats(),
        analyticsService.getMonthlyActivity(),
        analyticsService.getAcceptanceStats(),
        analyticsService.getImpactScore()
      ])

      // existing
      setStats(statsData)
      setPrograms(programsData.programs || [])
      setReports(reportsData || [])

      // process analytics
      const map = { critical: 0, high: 0, medium: 0, low: 0 }
      sev.data?.forEach(s => (map[s._id] = s.count))
      setSeverityData([
        { name: 'Critical', value: map.critical },
        { name: 'High', value: map.high },
        { name: 'Medium', value: map.medium },
        { name: 'Low', value: map.low },
      ])

      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setMonthlyData(mon.data?.map(m => ({ month: monthNames[m._id - 1], count: m.count })) || [])

      setAcceptStats(acc.data || [])
      setImpact(imp.data || { impactScore: 0 })

    } catch (error) {
      console.error(error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // file handler
  const handleFileChange = (e) => {
    setSubmitData({ ...submitData, file: e.target.files[0] })
  }

  // submit report
  const handleSubmitReport = async (e) => {
    e.preventDefault()
    if (!submitData.file) return toast.error('Please attach a report file')

    try {
      const formData = new FormData()
      Object.entries(submitData).forEach(([key, val]) => formData.append(key, val))

      await reportService.submitReport(formData)
      toast.success('Report submitted!')
      setShowSubmitModal(false)
      fetchAll()

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit')
    }
  }

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    triaged: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    duplicate: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }[status] || 'bg-gray-200 text-gray-800')

  return (
    <div className="space-y-8">

      {/* ------------------ NEW ANALYTICS SECTION ------------------ */}
      <h1 className="text-3xl font-bold">Hacker Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Impact Score" value={impact.impactScore} />
        <StatsCard title="Accepted Reports" value={acceptStats.find(a => a._id === 'accepted')?.count || 0} />
        <StatsCard title="Total Reports" value={acceptStats.reduce((s, x) => s + x.count, 0)} />
        <div className="card p-4">
          <LevelProgress xp={user?.xp || 0} level={user?.level || 1} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Chart */}
        <div className="card p-4 col-span-2">
          <h3 className="font-semibold mb-3">Monthly Activity</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Pie */}
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Severity Distribution</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {severityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Badges */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3">Your Badges</h3>
        <BadgeList badges={user?.badges || []} />
      </div>
      <div className="card p-4">
      <LevelProgress xp={user?.xp || 0} level={user?.level || 1} />
      <div className="mt-2 text-sm text-muted-foreground">Tier: {user?.tier || 'Bronze'} • Streak: {user?.streak || 0} days</div>
    </div>

      {/* ------------------ ORIGINAL DASHBOARD BELOW ------------------ */}

      {/* Top area with submit report */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-semibold">Reports & Programs</h2>
        <button onClick={() => setShowSubmitModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" /> Submit Report
        </button>
      </div>

      {/* Existing Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <div className="card">
            <p className="text-sm text-gray-400">Total Reports</p>
            <p className="text-2xl font-bold">{stats.totalReports}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-400">Accepted</p>
            <p className="text-2xl font-bold">{stats.acceptedReports}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-400">Points</p>
            <p className="text-2xl font-bold">{stats.points}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-400">Rank</p>
            <p className="text-2xl font-bold">#{stats.rank || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Programs + Reports grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Active programs */}
        <div className="card p-4">
          <h3 className="text-xl font-semibold mb-3">Active Programs</h3>
          {programs.length === 0 ? (
            <p>No active programs</p>
          ) : (
            <div className="space-y-3">
              {programs.map(p => (
                <Link key={p._id} to={`/programs/${p._id}`}>
                  <div className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-sm text-gray-500">{p.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My reports */}
        <div className="card p-4">
          <h3 className="text-xl font-semibold mb-3">My Reports</h3>
          {reports.length === 0 ? (
            <p>No reports submitted yet</p>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map(r => (
                <div key={r._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">{r.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{r.program?.title}</p>
                  {r.reward > 0 && (
                    <p className="text-green-600 font-medium">Reward: ${r.reward}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Submit Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Submit Bug Report</h2>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              {/* fields */}
              <div>
                <label className="block text-sm font-medium">Program</label>
                <select
                  required
                  className="input-field"
                  value={submitData.program}
                  onChange={(e) => setSubmitData({ ...submitData, program: e.target.value })}
                >
                  <option value="">Select a program</option>
                  {programs.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={submitData.title}
                  onChange={(e) => setSubmitData({ ...submitData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  required
                  rows={4}
                  className="input-field"
                  value={submitData.description}
                  onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Severity</label>
                <select
                  required
                  className="input-field"
                  value={submitData.severity}
                  onChange={(e) => setSubmitData({ ...submitData, severity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Report File</label>
                <input type="file" required accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Upload className="h-5 w-5" /> Submit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default HackerDashboard
