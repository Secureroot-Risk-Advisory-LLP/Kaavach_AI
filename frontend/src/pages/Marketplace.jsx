// frontend/src/pages/Marketplace.jsx

import { useState, useEffect } from "react";
import { extrasService } from "../services/extrasService";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  Search,
  ShoppingCart,
  Sparkles,
  Tag,
  PlusCircle,
  X,
  FileText,
} from "lucide-react";

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Create item modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Item form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    attachments: "",
    tags: "",
  });

  const CATEGORIES = [
    "all",
    "playbook",
    "recon",
    "script",
    "template",
    "premium",
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await extrasService.listMarketplace({ limit: 50 });
      setItems(res.data.items || []);
    } catch {
      toast.error("Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  };

  // Create new listing
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Title & Description required");
      return;
    }

    try {
      setSaving(true);

      await extrasService.createMarketplaceItem({
        ...formData,
        price: Number(formData.price),
        tags: formData.tags.split(",").map((t) => t.trim()),
        attachments: formData.attachments.split(",").map((a) => a.trim()),
      });

      toast.success("Item listed successfully!");

      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        attachments: "",
        tags: "",
      });

      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to list item");
    } finally {
      setSaving(false);
    }
  };

  // Filtering items
  const filtered = items.filter((i) => {
    const matchType =
      filterType === "all" ||
      i.tags?.includes(filterType) ||
      i.title.toLowerCase().includes(filterType);

    const matchQuery =
      !query ||
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.description.toLowerCase().includes(query.toLowerCase());

    return matchType && matchQuery;
  });

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            <Sparkles className="h-3 w-3" />
            Buy & Sell Security Resources
          </div>

          <h1 className="mt-3 text-3xl font-bold text-cyan-300 drop-shadow-[0_0_10px_rgba(0,255,255,.5)] flex items-center gap-3">
            <ShoppingCart className="h-7 w-7 text-cyan-300" />
            Marketplace
          </h1>

          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            Buy & sell playbooks, recon scripts, methodology templates, and premium resources built by researchers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(0,255,255,.5)] hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4 inline mr-1" />
          Sell Item
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* Search bar */}
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 w-full md:w-96">
          <Search className="h-4 w-4 text-cyan-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, templates..."
            className="bg-transparent text-sm text-white placeholder:text-gray-500 flex-1 focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`rounded-full border px-3 py-1 transition ${
                filterType === cat
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                  : "border-white/10 text-gray-300 hover:border-cyan-400/50 hover:text-cyan-100"
              }`}
            >
              {cat === "all" ? "All types" : cat}
            </button>
          ))}
        </div>

      </div>

      {/* MARKETPLACE GRID */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-white/20 rounded-2xl bg-white/5 p-10 text-center text-gray-400">
          No items found.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filtered.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_20px_rgba(0,255,255,.2)] hover:shadow-[0_0_30px_rgba(0,255,255,.4)] transition"
            >
              <h3 className="text-lg font-semibold text-white drop-shadow-[0_0_6px_rgba(0,255,255,.4)]">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-gray-400 line-clamp-3">
                {item.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {item.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-400/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Attachments */}
              {item.attachments?.length > 0 && (
                <div className="mt-3 flex flex-col gap-1 text-xs text-cyan-300">
                  <FileText className="h-4 w-4 inline" /> {item.attachments.length} files
                </div>
              )}

              {/* Bottom bar */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xl font-semibold text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,.5)]">
                  {item.price > 0 ? `₹${item.price}` : "FREE"}
                </div>

                <Link
                  to={`/marketplace/${item._id}`}
                  className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white text-sm hover:opacity-90 shadow-[0_0_10px_rgba(0,255,255,.5)]"
                >
                  View →
                </Link>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* ===========================
          CREATE ITEM MODAL
      ============================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl bg-[#0d1117] rounded-3xl border border-cyan-400/20 shadow-[0_0_25px_rgba(0,255,255,.5)]">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-cyan-300">Sell an Item</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/10 p-2 rounded-xl">
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-6 space-y-6">

              {/* Title */}
              <div>
                <label className="text-sm text-cyan-300">Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="OSINT Recon Playbook"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-cyan-300">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Describe what this resource contains..."
                  required
                />
              </div>

              {/* Price + Tags */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-sm text-cyan-300">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="0 for free"
                  />
                </div>

                <div>
                  <label className="text-sm text-cyan-300">Tags</label>
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="input-field"
                    placeholder="playbook, recon, osint"
                  />
                </div>

              </div>

              {/* Attachments */}
              <div>
                <label className="text-sm text-cyan-300">Attachment URLs (comma-separated)</label>
                <input
                  name="attachments"
                  value={formData.attachments}
                  onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                  className="input-field"
                  placeholder="https://file1.com, https://file2.com"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 shadow-[0_0_15px_rgba(0,255,255,.5)]"
                >
                  {saving ? "Publishing…" : "Publish Item"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Marketplace;
