import MarketplaceItem from "../models/MarketplaceItem.model.js";
import Writeup from "../models/Writeup.model.js";
import Job from "../models/Job.model.js";
import KBArticle from "../models/KBArticle.model.js";
import BreachAlert from "../models/BreachAlert.model.js";

// ===================== MARKETPLACE =====================
export const listMarketplace = async (req, res) => {
  const items = await MarketplaceItem.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json({ items });
};

export const getMarketplaceItem = async (req, res) => {
  const item = await MarketplaceItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
};

export const createMarketplaceItem = async (req, res) => {
  const data = req.body;
  data.sellerId = req.user._id;
  const item = await MarketplaceItem.create(data);
  res.json(item);
};

// ===================== WRITEUPS =====================
export const listWriteups = async (req, res) => {
  const writeups = await Writeup.find().populate("author", "name").sort({ createdAt: -1 });
  res.json({ writeups });
};

export const getWriteup = async (req, res) => {
  const item = await Writeup.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Writeup not found" });
  res.json(item);
};

export const createWriteup = async (req, res) => {
  const payload = { ...req.body, author: req.user._id };
  const w = await Writeup.create(payload);
  res.json(w);
};

// ===================== JOBS =====================
export const listJobs = async (req, res) => {
  const jobs = await Job.find({ isActive: true })
    .populate("companyId", "companyName avatar")
    .sort({ createdAt: -1 });
  res.json({ jobs });
};

export const getJob = async (req, res) => {
  const job = await Job.findById(req.params.id).populate("companyId", "companyName");
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
};

export const createJob = async (req, res) => {
  const data = { ...req.body, companyId: req.user._id };
  const job = await Job.create(data);
  res.json(job);
};

// ===================== KNOWLEDGE BASE =====================
export const listKB = async (req, res) => {
  const articles = await KBArticle.find({ published: true }).sort({ createdAt: -1 });
  res.json({ articles });
};

export const getKBArticle = async (req, res) => {
  const article = await KBArticle.findOne({ slug: req.params.slug });
  if (!article) return res.status(404).json({ message: "Article not found" });
  res.json(article);
};

export const createKBArticle = async (req, res) => {
  const payload = { ...req.body, author: req.user._id };
  const newArticle = await KBArticle.create(payload);
  res.json(newArticle);
};

// ===================== BREACH ALERTS =====================
export const listBreachAlerts = async (req, res) => {
  const alerts = await BreachAlert.find({}).sort({ createdAt: -1 });
  res.json({ alerts });
};

export const createBreachAlert = async (req, res) => {
  const alert = await BreachAlert.create(req.body);
  res.json(alert);
};
