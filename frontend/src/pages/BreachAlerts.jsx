import { useState, useEffect } from "react";
import { extrasService } from "../services/extrasService";
import toast from "react-hot-toast";

import {
  ShieldAlert,
  Flame,
  Clock,
  Globe2,
  AlertTriangle,
  X,
} from "lucide-react";

const severityColors = {
  critical: "from-red-600/70 to-rose-600/40 border-red-400/60",
  high: "from-orange-500/70 to-amber-500/30 border-orange-400/60",
  medium: "from-yellow-500/60 to-amber-400/25 border-yellow-300/60",
  low: "from-emerald-500/40 to-emerald-400/20 border-emerald-300/50",
};

const BreachAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    affectedDomain: "",
    source: "",
    threatType: "",
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await extrasService.listBreachAlerts();
      setAlerts(res.data.alerts || []);
    } catch {
      toast.error("Failed to load breach alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Title & description are required");
      return;
    }

    try {
      setSaving(true);
      await extrasService.createBreachAlert(formData);
      toast.success("Alert created!");

      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        severity: "medium",
        affectedDomain: "",
        source: "",
        threatType: "",
      });

      fetchAlerts();
    } catch (err) {
      toast.error("Failed to create breach alert");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
            <Flame className="h-3 w-3" />
            Real-time breach feed
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-white flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-red-400" />
            Breach Alerts
          </h1>

          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            Track simulated breaches, leaked credentials, exposed services and risk spikes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 h-fit rounded-xl bg-gradient-to-r from-red-500 to-rose-600 
          text-white font-semibold shadow-[0_0_15px_rgba(255,60,60,.5)] hover:opacity-90"
        >
          + Create Alert
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-sm text-gray-400">
          No active breach alerts.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => {
            const sev = (a.severity || "medium").toLowerCase();
            const color = severityColors[sev] || severityColors.medium;

            return (
              <div
                key={a._id}
                className={`relative rounded-2xl border bg-gradient-to-r ${color} p-5 shadow-xl`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                  {/* LEFT SECTION */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                      <AlertTriangle className="h-3 w-3" />
                      {sev.toUpperCase()}
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      {a.title}
                    </h3>

                    <p className="text-sm text-white/80">{a.description}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-white/80 pt-2">
                      {a.affectedDomain && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1">
                          <Globe2 className="h-3 w-3" />
                          {a.affectedDomain}
                        </span>
                      )}

                      {a.source && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1">
                          Source: {a.source}
                        </span>
                      )}

                      {a.threatType && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1">
                          {a.threatType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT META */}
                  <div className="flex flex-col items-end gap-2 text-xs text-white/80">
                    <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1">
                      <Clock className="h-3 w-3" />
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-[#0d1117] rounded-3xl border border-red-400/30 shadow-[0_0_25px_rgba(255,0,0,.5)]">

            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-red-300">Create Breach Alert</h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-white/10 p-2 rounded-xl"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleCreate} className="px-6 py-6 space-y-5">

              <div>
                <label className="text-sm text-red-300">Title *</label>
                <input
                  className="input-field"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Massive credential leak found"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-red-300">Description *</label>
                <textarea
                  className="input-field"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the breach..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <label className="text-sm text-red-300">Severity</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-red-300">Affected Domain</label>
                  <input
                    className="input-field"
                    name="affectedDomain"
                    value={formData.affectedDomain}
                    onChange={handleChange}
                    placeholder="example.com"
                  />
                </div>

                <div>
                  <label className="text-sm text-red-300">Source</label>
                  <input
                    className="input-field"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    placeholder="Dark web dump, Telegram group..."
                  />
                </div>

                <div>
                  <label className="text-sm text-red-300">Threat Type</label>
                  <input
                    className="input-field"
                    name="threatType"
                    value={formData.threatType}
                    onChange={handleChange}
                    placeholder="Credentials Leak / Malware / Exposure"
                  />
                </div>

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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-[0_0_15px_rgba(255,0,0,.5)] hover:opacity-90"
                >
                  {saving ? "Saving…" : "Create Alert"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BreachAlerts;
