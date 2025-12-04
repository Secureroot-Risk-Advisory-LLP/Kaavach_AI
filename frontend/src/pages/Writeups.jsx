// frontend/src/pages/Writeups.jsx

import { useState, useEffect } from "react";
import { extrasService } from "../services/extrasService";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  FileText,
  Clock,
  User,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const Writeups = () => {
  const [writeups, setWriteups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "Bug Bounty",
  });

  const fetchWriteups = async () => {
    try {
      setLoading(true);
      const res = await extrasService.listWriteups({ limit: 24 });
      setWriteups(res.data.writeups || []);
    } catch {
      toast.error("Failed to load writeups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWriteups();
  }, []);

  const filtered = writeups.filter((w) => {
    if (!query) return true;
    return (
      w.title?.toLowerCase().includes(query.toLowerCase()) ||
      w.summary?.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.content) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      await extrasService.createWriteup(formData);
      toast.success("Writeup created!");
      setShowModal(false);

      setFormData({
        title: "",
        summary: "",
        content: "",
        category: "Bug Bounty",
      });

      fetchWriteups();
    } catch (err) {
      toast.error("Failed to create writeup");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
            <Sparkles className="h-3 w-3" />
            Deep research from real hunters
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-white flex items-center gap-3">
            <FileText className="h-7 w-7 text-cyan-300" />
            Writeups Hub
          </h1>

          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            Detailed breakdowns of real-world vulnerabilities, chained exploits,
            and creative attack paths.
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col md:items-end gap-3">

          {/* Search Bar */}
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 w-full md:w-72">
            <Search className="h-4 w-4 text-cyan-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search writeups…"
              className="bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none flex-1"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(0,255,255,.5)] hover:opacity-90"
          >
            + Create Writeup
          </button>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-gray-400">
          No writeups published yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((w) => (
            <Link
              to={`/writeups/${w._id}`}
              key={w._id}
              className="group flex flex-col justify-between rounded-2xl 
              border border-white/10 bg-gradient-to-br from-slate-900/80 
              via-slate-900/40 to-blue-900/20 p-5 shadow-lg 
              hover:border-cyan-400/60 hover:shadow-cyan-600/30 transition"
            >
              <div>
                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[11px] uppercase text-cyan-200">
                    {w.category}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3" />
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-200">
                  {w.title}
                </h3>

                <p className="mt-2 text-sm text-gray-400 line-clamp-3">
                  {w.summary}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <div className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-300" />
                  <span>{w.author?.name || "Researcher"}</span>
                </div>

                <span className="inline-flex items-center gap-1 text-cyan-300">
                  Read writeup →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl bg-[#0d1117] rounded-3xl border border-cyan-400/20 shadow-xl">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-cyan-300">Create Writeup</h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-white/10 p-2 rounded-xl"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="px-6 py-6 space-y-6">

              <div>
                <label className="text-sm text-cyan-300">Title *</label>
                <input
                  className="input-field"
                  value={formData.title}
                  name="title"
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm text-cyan-300">Summary *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, summary: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm text-cyan-300">Content *</label>
                <textarea
                  className="input-field"
                  rows={6}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, content: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 
                  text-white font-semibold shadow-[0_0_15px_rgba(0,255,255,.5)] hover:opacity-90"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Publish Writeup"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Writeups;
