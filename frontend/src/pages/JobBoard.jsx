// frontend/src/pages/JobBoard.jsx

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { extrasService } from "../services/extrasService";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  Building2,
  MapPin,
  Briefcase,
  ArrowUpRight,
  Image as ImageIcon,
  X,
} from "lucide-react";

const JobBoard = () => {
  const { user } = useSelector((state) => state.auth);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    logoUrl: "",
    title: "",
    description: "",
    location: "",
    applyUrl: "",
    jobType: "Full-time",
    seniority: "Mid",
    salaryRange: "",
    tags: "",
  });

  const canCreate = user && (user.role === "company" || user.role === "admin");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await extrasService.listJobs({ limit: 20 });
      setJobs(res.data.jobs || []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Title & description required");
      return;
    }

    try {
      setSaving(true);
      await extrasService.createJob({
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()),
      });

      toast.success("Job posted successfully!");
      setShowModal(false);

      setFormData({
        logoUrl: "",
        title: "",
        description: "",
        location: "",
        applyUrl: "",
        jobType: "Full-time",
        seniority: "Mid",
        salaryRange: "",
        tags: "",
      });

      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,.4)]">
          Job Board
        </h1>

        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 text-white font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 shadow-[0_0_15px_rgba(0,255,255,.4)] transition"
          >
            + Post Job
          </button>
        )}
      </div>

      {/* JOB CARDS */}
      {loading ? (
        <p className="text-gray-300">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-400">No jobs available.</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="relative rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(0,255,255,.2)] hover:shadow-[0_0_30px_rgba(0,255,255,.4)] transition"
            >
              {/* Logo + Title */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl border border-cyan-300/30 bg-black/40 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(0,255,255,.4)]">
                  {job.logoUrl ? (
                    <img
                      src={job.logoUrl}
                      alt="logo"
                      className="h-full w-full object-contain bg-white"
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-cyan-300" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white drop-shadow-[0_0_6px_rgba(0,255,255,.4)]">
                    {job.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {job.companyId?.companyName || "Company"}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="mt-3 space-y-2 text-gray-300 text-sm">
                {job.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    {job.location}
                  </p>
                )}

                <p className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-cyan-400" />
                  {job.jobType}
                </p>

                <p className="text-xs opacity-80">
                  {job.description?.slice(0, 180)}...
                </p>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-400/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA BUTTON */}
              <div className="mt-4">
                {job.applyUrl ? (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center gap-2 w-fit hover:opacity-90 shadow-[0_0_12px_rgba(0,255,255,.4)] transition"
                  >
                    Apply <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    to={`/jobs/${job._id}`}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center gap-2 w-fit hover:opacity-90 shadow-[0_0_12px_rgba(0,255,255,.4)] transition"
                  >
                    View Details <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL (C1 Cyber Theme) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl bg-[#0d1117] rounded-3xl border border-cyan-400/20 shadow-[0_0_25px_rgba(0,255,255,.5)]">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-cyan-300">
                Post a Job
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-white/10 p-2 rounded-xl"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreate} className="px-6 py-6 space-y-8">
              
              {/* LOGO PREVIEW */}
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-xl border border-cyan-300/30 bg-black/40 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(0,255,255,.4)]">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      className="h-full w-full object-contain bg-white"
                    />
                  ) : (
                    <ImageIcon className="h-7 w-7 text-gray-400" />
                  )}
                </div>

                <input
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://company.com/logo.png"
                  className="input-field flex-1"
                />
              </div>

              {/* GRID */}
              <div className="grid md:grid-cols-2 gap-6">
                
                <div>
                  <label className="text-sm text-cyan-300">Job Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Security Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-cyan-300">Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Remote / Noida"
                  />
                </div>

                <div>
                  <label className="text-sm text-cyan-300">Apply URL</label>
                  <input
                    name="applyUrl"
                    value={formData.applyUrl}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://careers.example.com"
                  />
                </div>

                <div>
                  <label className="text-sm text-cyan-300">Salary Range</label>
                  <input
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="₹8L – ₹20L"
                  />
                </div>

                <div>
                  <label className="text-sm text-cyan-300">Job Type</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-cyan-300">Seniority</label>
                  <select
                    name="seniority"
                    value={formData.seniority}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option>Intern</option>
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm text-cyan-300">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe job responsibilities..."
                  className="input-field"
                  required
                />
              </div>

              {/* TAGS */}
              <div>
                <label className="text-sm text-cyan-300">Skills / Tags</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="AppSec, Bug Bounty, Pentesting"
                  className="input-field"
                />
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(0,255,255,.5)] hover:opacity-90"
                >
                  {saving ? "Posting…" : "Post Job"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobBoard;
