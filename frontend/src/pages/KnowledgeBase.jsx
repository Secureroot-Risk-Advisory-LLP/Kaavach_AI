// frontend/src/pages/KnowledgeBase.jsx

import { useState, useEffect } from "react";
import { extrasService } from "../services/extrasService";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  BookOpen,
  Search,
  Layers,
  Sparkles,
  X,
  Tag,
} from "lucide-react";

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create Article (ALL USERS ALLOWED)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "general",
    summary: "",
    content: "",
    tags: "",
    readTime: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await extrasService.listKB({ limit: 50 });
      setArticles(res.data.articles || []);
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const categories = [
    "all",
    "general",
    "programs",
    "security",
    "reports",
    "guides",
    "other",
  ];

  const filtered = articles.filter((a) => {
    const matchCategory =
      filterCategory === "all" || a.category === filterCategory;

    const matchQuery =
      !query ||
      a.title?.toLowerCase().includes(query.toLowerCase()) ||
      a.summary?.toLowerCase().includes(query.toLowerCase());

    return matchCategory && matchQuery;
  });

  // Create Article
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.summary || !formData.content) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      await extrasService.createKBArticle({
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()),
      });

      toast.success("Article created!");
      setShowModal(false);

      setFormData({
        title: "",
        slug: "",
        category: "general",
        summary: "",
        content: "",
        tags: "",
        readTime: "",
      });

      fetchArticles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create article");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
            <Sparkles className="h-3 w-3" />
            Knowledge & Documentation
          </div>

          <h1 className="mt-3 text-3xl font-bold text-cyan-300 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(0,255,255,.5)]">
            <BookOpen className="h-7 w-7 text-cyan-300" />
            Knowledge Base
          </h1>

          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            Learn about Kaavach — programs, reporting tips, workflows, and security knowledge.
          </p>
        </div>

        {/* SEARCH + CATEGORY + CREATE BUTTON */}
        <div className="flex flex-col gap-3 md:items-end">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 w-full md:w-80">
            <Search className="h-4 w-4 text-cyan-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="bg-transparent text-sm text-white placeholder:text-gray-500 flex-1 focus:outline-none"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full border px-3 py-1 transition ${
                  filterCategory === cat
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                    : "border-white/10 bg-transparent text-gray-300 hover:border-cyan-300/60 hover:text-cyan-100"
                }`}
              >
                {cat === "all" ? "All topics" : cat.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* CREATE ARTICLE — ALL USERS */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 shadow-[0_0_10px_rgba(0,255,255,.5)]"
          >
            + Create Article
          </button>
        </div>
      </div>

      {/* ARTICLE GRID */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-gray-400 text-sm">
          No articles available.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <Link
              key={a._id}
              to={`/kb/${a.slug}`}
              className="group flex flex-col rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_20px_rgba(0,255,255,.2)] hover:shadow-[0_0_30px_rgba(0,255,255,.4)] transition"
            >
              {/* Category + Read time */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-[11px] uppercase text-gray-400">
                  <Layers className="h-3 w-3 text-cyan-300" />
                  {a.category || "general"}
                </div>
                {a.readTime && (
                  <span className="text-[11px] text-gray-400">{a.readTime} min</span>
                )}
              </div>

              <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-cyan-200 drop-shadow-[0_0_6px_rgba(0,255,255,.4)]">
                {a.title}
              </h3>

              <p className="mt-2 text-sm text-gray-400 line-clamp-3">{a.summary}</p>

              <div className="mt-3 text-xs text-cyan-300 flex items-center gap-2">
                Read Article →
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ===========================
          CREATE ARTICLE MODAL
      ============================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl bg-[#0d1117] rounded-3xl border border-cyan-400/20 shadow-[0_0_25px_rgba(0,255,255,.5)]">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-cyan-300">Create Article</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-2 rounded-xl">
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreate} className="px-6 py-6 space-y-6">

              {/* Title */}
              <div>
                <label className="text-sm text-cyan-300">Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/ /g, "-"),
                    }))
                  }
                  className="input-field"
                  placeholder="How to write a clean bug report"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-sm text-cyan-300">Slug</label>
                <input
                  name="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, slug: e.target.value }))
                  }
                  className="input-field"
                  placeholder="auto-generated"
                />
              </div>

              {/* Category + ReadTime */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-cyan-300">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    className="input-field"
                  >
                    <option>general</option>
                    <option>programs</option>
                    <option>security</option>
                    <option>reports</option>
                    <option>guides</option>
                    <option>other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-cyan-300">Read Time (min)</label>
                  <input
                    name="readTime"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, readTime: e.target.value }))
                    }
                    className="input-field"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="text-sm text-cyan-300">Summary *</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, summary: e.target.value }))
                  }
                  rows={3}
                  className="input-field"
                  placeholder="Short description…"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-sm text-cyan-300">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, content: e.target.value }))
                  }
                  rows={6}
                  className="input-field"
                  placeholder="Full article content…"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm text-cyan-300 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-cyan-300" /> Tags
                </label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, tags: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Bug bounty, XSS, Reporting"
                />
              </div>

              {/* Footer */}
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
                  {saving ? "Publishing…" : "Publish Article"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default KnowledgeBase;
