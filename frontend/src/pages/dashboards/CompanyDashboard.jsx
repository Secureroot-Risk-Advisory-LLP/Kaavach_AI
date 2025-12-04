import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { programService } from '../../services/programService';
import { reportService } from '../../services/reportService';
import { analyticsService } from '../../services/analyticsService';

import {
  Building2,
  Plus,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const CompanyDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [programs, setPrograms] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState({
    funnel: null,
    rewards: null,
    ttr: null,
  });

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [programData, setProgramData] = useState({
    title: '',
    description: '',
    rules: '',
    severityLevels: [],
    rewardRange: { min: 0, max: 0 },
  });

  const [reviewData, setReviewData] = useState({
    status: 'pending',
    reward: 0,
    reviewNotes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  // FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        programsData,
        reportsData,
        funnelData,
        rewardData,
        ttrData,
      ] = await Promise.all([
        programService.getPrograms({ createdBy: user?._id }),
        reportService.getCompanyReports(),
        analyticsService.getCompanyReportFunnel(),
        analyticsService.getCompanyRewardSummary(),
        analyticsService.getCompanyTTR(),
      ]);

      setPrograms(programsData.programs || []);
      setReports(reportsData || []);

      setAnalytics({
        funnel: funnelData.data || [],
        rewards: rewardData.data || { totalRewards: 0, avgReward: 0 },
        ttr: ttrData.data || { avgTTR: 0 },
      });

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // CREATE PROGRAM
  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      await programService.createProgram(programData);
      toast.success('Program created successfully!');
      setShowProgramModal(false);

      setProgramData({
        title: '',
        description: '',
        rules: '',
        severityLevels: [],
        rewardRange: { min: 0, max: 0 },
      });

      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create program');
    }
  };

  // TOGGLE SEVERITY
  const handleSeverityToggle = (severity) => {
    const current = programData.severityLevels;
    if (current.includes(severity)) {
      setProgramData({
        ...programData,
        severityLevels: current.filter((s) => s !== severity),
      });
    } else {
      setProgramData({
        ...programData,
        severityLevels: [...current, severity],
      });
    }
  };

  // REVIEW REPORT
  const handleReviewReport = async (e) => {
    e.preventDefault();
    try {
      const result = await reportService.updateReportStatus(
        selectedReport._id,
        reviewData
      );

      toast.success("Report updated");

      setShowReportModal(false);
      setSelectedReport(null);
      setReviewData({ status: 'pending', reward: 0, reviewNotes: '' });

      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const openReviewModal = (report) => {
    setSelectedReport(report);
    setReviewData({
      status: report.status,
      reward: report.reward || 0,
      reviewNotes: report.reviewNotes || '',
    });
    setShowReportModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      triaged: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      duplicate: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[status] || colors.pending;
  };

  const totalRewards = reports
    .filter((r) => r.status === 'accepted')
    .reduce((sum, r) => sum + (r.reward || 0), 0);

  // ============================
  //  RETURN UI
  // ============================

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Dashboard</h1>

        <button
          onClick={() => setShowProgramModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Program</span>
        </button>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Programs */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Programs</p>
              <p className="text-2xl font-bold">{programs.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        {/* Reports */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reports</p>
              <p className="text-2xl font-bold">{reports.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Pending */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold">
                {reports.filter((r) => r.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        {/* Rewards */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</p>
              <p className="text-2xl font-bold">${totalRewards}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

      </div>

      {/* ======================== */}
      {/* ANALYTICS GRIDS */}
      {/* ======================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        {/* FUNNEL */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Report Funnel</h2>

          {analytics.funnel?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No data</p>
          )}
        </div>

        {/* REWARD SUMMARY (FIXED) */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Reward Summary</h2>

          <div className="space-y-4 text-sm">
            <p>Total Rewards Paid:</p>
            <h3 className="text-2xl font-bold text-emerald-400">
              ${analytics.rewards?.totalRewards || 0}
            </h3>

            <p className="mt-2">Average Reward:</p>
            <h3 className="text-xl font-semibold text-cyan-400">
              ${analytics.rewards?.avgReward || 0}
            </h3>
          </div>
        </div>

        {/* TTR */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Avg Time To Resolve</h2>

          <p className="text-gray-200">
            Average Resolution Time:
          </p>

          <p className="text-3xl font-bold text-primary-400 mt-2">
            {analytics.ttr?.avgTTR?.toFixed(2) || 0} days
          </p>
        </div>

      </div>

      {/* PROGRAMS + REPORTS */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">

        {/* PROGRAM LIST */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">My Programs</h2>

          {programs.length === 0 ? (
            <p>No programs yet</p>
          ) : (
            programs.map((program) => (
              <div key={program._id} className="p-3 border rounded mb-2">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{program.title}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">
                    {program.status}
                  </span>
                </div>

                <p className="text-sm opacity-70">{program.description}</p>
              </div>
            ))
          )}
        </div>

        {/* REPORT LIST */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Reports</h2>

          {reports.length === 0 ? (
            <p>No reports</p>
          ) : (
            reports.slice(0, 5).map((report) => (
              <div
                key={report._id}
                className="p-3 border rounded mb-2 cursor-pointer"
                onClick={() => openReviewModal(report)}
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold">{report.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                </div>

                <p className="text-sm opacity-70">
                  Severity: {report.severity}
                </p>

                {report.reward > 0 && (
                  <p className="text-green-400 text-sm">Reward: ${report.reward}</p>
                )}
              </div>
            ))
          )}
        </div>

      </div>

      {/* ============= */}
      {/* MODALS */}
      {/* ============= */}

      {/* Create Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-xl space-y-4">

            <h2 className="text-xl font-bold">Create Program</h2>

            <form onSubmit={handleCreateProgram} className="space-y-4">

              <input
                type="text"
                placeholder="Title"
                className="input-field"
                value={programData.title}
                onChange={(e) =>
                  setProgramData({ ...programData, title: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="input-field"
                rows="4"
                value={programData.description}
                onChange={(e) =>
                  setProgramData({ ...programData, description: e.target.value })
                }
              />

              <textarea
                placeholder="Rules"
                className="input-field"
                rows="4"
                value={programData.rules}
                onChange={(e) =>
                  setProgramData({ ...programData, rules: e.target.value })
                }
              />

              <div>
                <label className="block mb-2">Allowed Severities:</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => handleSeverityToggle(sev)}
                      className={`px-3 py-1 rounded ${
                        programData.severityLevels.includes(sev)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Min Reward"
                  className="input-field"
                  value={programData.rewardRange.min}
                  onChange={(e) =>
                    setProgramData({
                      ...programData,
                      rewardRange: {
                        ...programData.rewardRange,
                        min: parseInt(e.target.value),
                      },
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Max Reward"
                  className="input-field"
                  value={programData.rewardRange.max}
                  onChange={(e) =>
                    setProgramData({
                      ...programData,
                      rewardRange: {
                        ...programData.rewardRange,
                        max: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowProgramModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-xl space-y-4">

            <h2 className="text-xl font-bold">Review Report</h2>

            <form onSubmit={handleReviewReport} className="space-y-4">

              <select
                className="input-field"
                value={reviewData.status}
                onChange={(e) =>
                  setReviewData({ ...reviewData, status: e.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="triaged">Triaged</option>
                <option value="duplicate">Duplicate</option>
              </select>

              <input
                type="number"
                className="input-field"
                placeholder="Reward"
                value={reviewData.reward}
                onChange={(e) =>
                  setReviewData({ ...reviewData, reward: parseInt(e.target.value) })
                }
              />

              <textarea
                className="input-field"
                rows="4"
                placeholder="Review Notes"
                value={reviewData.reviewNotes}
                onChange={(e) =>
                  setReviewData({ ...reviewData, reviewNotes: e.target.value })
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyDashboard;
