const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Post = require("../models/Post");
function removeImage(fileName) {
  if (!fileName) return;

  fs.unlink(path.join("uploads", fileName), (err) => {
    if (err) {
      console.log("Could not remove image:", err.message);
    }
  });
}

function sendError(res, status, message, uploadedFile) {
  removeImage(uploadedFile);
  return res.status(status).json({ message });
}
function liveFilter() {
  return {
    status: "published",
    publishAt: { $lte: new Date() }
  };
}

function canManage(blog, user) {
  return blog.author.toString() === user.id || user.role === "admin";
}

function checkBlogData(title, content, category) {
  if (!title || !title.trim() || !content || !content.trim()) {
    return "Title and content are required";
  }

  if (title.trim().length > 150) {
    return "Title must be 150 characters or less";
  }

  if (!category || !category.trim()) {
    return "Please select a category";
  }

  return "";
}

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
async function makeUniqueSlug(text, blogId = null) {
  const baseSlug = createSlug(text) || "blog";
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existingBlog = await Post.findOne({
      slug,
      ...(blogId ? { _id: { $ne: blogId } } : {})
    });

    if (!existingBlog) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }
}

function parseTags(tags) {
  if (!tags) return [];

  let list = tags;

  if (typeof tags === "string") {
    try {
      list = JSON.parse(tags);
    } catch (err) {
      list = tags.split(",");
    }
  }

  if (!Array.isArray(list)) return [];

  return list
    .map((tag) => String(tag).trim().replace(/^#/, ""))
    .filter(Boolean);
}
function getStatus(value) {
  return value === "draft" ? "draft" : "published";
}

function getPublishDate(body) {
  const value = body.publishAt || body.scheduledAt;
  const date = value ? new Date(value) : new Date();

  return isNaN(date.getTime()) ? new Date() : date;
}
async function getBlogs(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = liveFilter();

    if (req.query.search) {
      const text = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: text, $options: "i" } },
        { content: { $regex: text, $options: "i" } }
      ];
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const [blogs, total] = await Promise.all([
Post.find(filter)
        .populate("author", "name bio")
 .sort({ publishAt: -1 })
        .skip(skip)
      .limit(limit),

      Post.countDocuments(filter)
    ]);

    res.json({
      blogs,
      currentPage: page,
   totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getTrendingBlogs(req, res) {
  try {
    const blogs = await Post.find(liveFilter())
      .populate("author", "name")
    .sort({ views: -1 })
      .limit(10);

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getFeaturedBlogs(req, res) {
  try {
    const blogs = await Post.find({ ...liveFilter(), isFeatured: true })
      .populate("author", "name")
      .sort({ publishAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
async function getBlogBySlug(req, res) {
  try {
    const blog = await Post.findOneAndUpdate(
      { ...liveFilter(), slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "name bio");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getRelatedBlogs(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const currentBlog = await Post.findById(req.params.id);

    if (!currentBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const blogs = await Post.find({
      ...liveFilter(),
      _id: { $ne: currentBlog._id },
      category: currentBlog.category
    })
      .populate("author", "name")
      .sort({ publishAt: -1 })
      .limit(5);

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getAdjacentBlogs(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const currentBlog = await Post.findById(req.params.id);

    if (!currentBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const [previous, next] = await Promise.all([
      Post.findOne({
        status: "published",
        publishAt: { $lt: currentBlog.publishAt }
      }).sort({ publishAt: -1 }),

      Post.findOne({
        status: "published",
        publishAt: { $gt: currentBlog.publishAt, $lte: new Date() }
      }).sort({ publishAt: 1 })
    ]);

    res.json({ previous, next });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
async function getBlogById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Post.findOne({
      ...liveFilter(),
      _id: req.params.id
    }).populate("author", "name bio");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
async function getMyBlogs(req, res) {
  try {
    const blogs = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });

    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
async function getBlogForEdit(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Post.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!canManage(blog, req.user)) {
      return res.status(403).json({ message: "You cannot edit this blog" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
function uploadContentImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.status(201).json({ url });
}
async function createBlog(req, res) {
  const newImage = req.file ? req.file.filename : "";

  try {
    const { title, content, category } = req.body;
    const message = checkBlogData(title, content, category);

    if (message) {
      return sendError(res, 400, message, newImage);
    }

    const blog = await Post.create({
      title: title.trim(),
      content,
      category: category.trim(),
      image: newImage,
      author: req.user.id,
      slug: await makeUniqueSlug(req.body.slug || title),
      tags: parseTags(req.body.tags),
      seoTitle: req.body.seoTitle || "",
      metaDescription: req.body.metaDescription || req.body.seoDescription || "",
      status: getStatus(req.body.status),
      isFeatured: req.user.role === "admin" && req.body.isFeatured === "true",
      publishAt: getPublishDate(req.body)
    });

    res.status(201).json(blog);
  } catch (err) {
    sendError(res, 500, "Server error", newImage);
  }}
async function updateBlog(req, res) {
  const newImage = req.file ? req.file.filename : "";

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 400, "Invalid blog id", newImage);
    }

    const blog = await Post.findById(req.params.id);

    if (!blog) {
      return sendError(res, 404, "Blog not found", newImage);
    }

    if (!canManage(blog, req.user)) {
      return sendError(res, 403, "You cannot edit this blog", newImage);
    }

    const { title, content, category } = req.body;
    const message = checkBlogData(title, content, category);

    if (message) {
      return sendError(res, 400, message, newImage);
    }

    const oldImage = blog.image;
    const wasDraft = blog.status === "draft";

    blog.title = title.trim();
    blog.content = content;
    blog.category = category.trim();
    blog.tags = parseTags(req.body.tags);
    blog.seoTitle = req.body.seoTitle || "";
    blog.metaDescription = req.body.metaDescription || req.body.seoDescription || "";

    if (req.body.status) {
      blog.status = getStatus(req.body.status);
    }

    if (req.body.publishAt || req.body.scheduledAt) {
      blog.publishAt = getPublishDate(req.body);
    } else if (wasDraft && blog.status === "published") {
      // A draft that is published now should show as a new blog
      blog.publishAt = new Date();
    }

    if (req.user.role === "admin" && req.body.isFeatured !== undefined) {
      blog.isFeatured = req.body.isFeatured === "true";
    }

    const slugText = req.body.slug || (blog.slug ? "" : title);

    if (slugText) {
      blog.slug = await makeUniqueSlug(slugText, blog._id);
    }

    if (newImage) {
      blog.image = newImage;
    }

    await blog.save();

    if (newImage) {
      removeImage(oldImage);
    }

    res.json(blog);
  } catch (err) {
    sendError(res, 500, "Server error", newImage);
  }
}
async function deleteBlog(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Post.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!canManage(blog, req.user)) {
      return res.status(403).json({ message: "You cannot delete this blog" });
    }

    await blog.deleteOne();
    removeImage(blog.image);

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getBlogs,
  getTrendingBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  getAdjacentBlogs,
  getBlogById,
  getMyBlogs,
  getBlogForEdit,
  uploadContentImage,
  createBlog,
  updateBlog,
  deleteBlog
};