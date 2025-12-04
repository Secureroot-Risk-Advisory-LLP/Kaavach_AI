import mongoose from "mongoose";
import slugify from "slugify";

const KBArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      unique: true
    },

    summary: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ["general", "programs", "security", "reports", "guides", "other"],
      default: "general"
    },

    readTime: {
      type: String,
      default: "5"
    },

    tags: {
      type: [String],
      default: []
    },

    published: {
      type: Boolean,
      default: true
    },

    // Link to user
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Auto-generate slug if missing
KBArticleSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true
    });
  }
  next();
});

export default mongoose.model("KBArticle", KBArticleSchema);
