const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
 content: {
      type: String,
      required: true
    }, category: {
      type: String,
      required: true,
      trim: true
    },image: {
      type: String,
      default: ""
    }, author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }, slug: {
      type: String,
      unique: true,
      sparse: true
    },  tags: [{ type: String, trim: true }], seoTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "published"
    },

    isFeatured: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },
    publishAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);