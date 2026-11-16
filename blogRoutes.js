
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const categories = [
  "Web Development",
  "AI & ML",
  "Software Development",
  "Technology",
  "Cybersecurity",
  "Cloud Computing",
  "Education",
  "Lifestyle",
  "Travel",
  "Food"
];

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

function checkBlogData(title, content, category) {
  if (!title || !content) {
    return "Title and content are required";
  }

  if (title.length > 100) {
    return "Title must be 100 characters or less";
  }

  if (!categories.includes(category)) {
    return "Invalid category";
  }

  return "";
}

function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSlug(title, blogId = null) {
  const baseSlug = createSlug(title);
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

function getTags(tags) {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.map(tag => tag.trim()).filter(Boolean);
  }

  return tags.split(",").map(tag => tag.trim()).filter(Boolean);
}

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      status: "published",
      publishAt: { $lte: new Date() }
    };

    if (req.query.search) {
      const text = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: text, $options: "i" };
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
});

router.get("/trending", async (req, res) => {
  try {
    const blogs = await Post.find({
      status: "published",
      publishAt: { $lte: new Date() }
    })
      .populate("author", "name")
      .sort({ views: -1 })
      .limit(10);

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const blogs = await Post.find({
      status: "published",
      isFeatured: true,
      publishAt: { $lte: new Date() }
    })
      .populate("author", "name")
      .sort({ publishAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const blog = await Post.findOneAndUpdate(
      {
        slug: req.params.slug,
        status: "published",
        publishAt: { $lte: new Date() }
      },
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
});

router.get("/related/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const currentBlog = await Post.findById(req.params.id);

    if (!currentBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const blogs = await Post.find({
      _id: { $ne: currentBlog._id },
      category: currentBlog.category,
      status: "published",
      publishAt: { $lte: new Date() }
    })
      .populate("author", "name")
      .sort({ publishAt: -1 })
      .limit(5);

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/adjacent/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const currentBlog = await Post.findById(req.params.id);

    if (!currentBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const filter = {
      status: "published",
      publishAt: { $lte: new Date() }
    };

    const [previous, next] = await Promise.all([
      Post.findOne({
        ...filter,
        publishAt: { $lt: currentBlog.publishAt }
      }).sort({ publishAt: -1 }),

      Post.findOne({
        ...filter,
        publishAt: { $gt: currentBlog.publishAt }
      }).sort({ publishAt: 1 })
    ]);

    res.json({ previous, next });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
    try {
        const blogs = await Post.find({
            author: req.user.id
        }).sort({ createdAt: -1 });

        res.json({ blogs });
    } catch (err) {
        res.status(500).json({
            message: "Unable to load your blogs"
        });
    }
});
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Post.findOne({
      _id: req.params.id,
      status: "published",
      publishAt: { $lte: new Date() }
    }).populate("author", "name bio");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  const newImage = req.file ? req.file.filename : "";

  try {
    const {
      title,
      content,
      category,
      tags,
      seoTitle,
      metaDescription,
      publishAt
    } = req.body;

    const message = checkBlogData(title, content, category);

    if (message) {
      return sendError(res, 400, message, newImage);
    }

    const slug = await generateUniqueSlug(title);

    const blog = await Post.create({
      title: title.trim(),
      content,
      category,
      image: newImage,
      author: req.user.id,
      slug,
      tags: getTags(tags),
      seoTitle: seoTitle || "",
      metaDescription: metaDescription || "",
      publishAt: req.body.status === "scheduled" && req.body.scheduledAt
        ? new Date(req.body.scheduledAt)
        : new Date(),
      status: ["draft", "scheduled"].includes(req.body.status)
        ? req.body.status
        : "published"
    });

    res.status(201).json(blog);
  } catch (err) {
    sendError(res, 500, "Server error", newImage);
  }
});

router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  const newImage = req.file ? req.file.filename : "";

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 400, "Invalid blog id", newImage);
    }

    const blog = await Post.findById(req.params.id);

    if (!blog) {
      return sendError(res, 404, "Blog not found", newImage);
    }

    const isOwner = blog.author.toString() === req.user.id;

    if (!isOwner && req.user.role !== "admin") {
      return sendError(res, 403, "You cannot edit this blog", newImage);
    }

    const { title, content, category } = req.body;
    const message = checkBlogData(title, content, category);

    if (message) {
      return sendError(res, 400, message, newImage);
    }

    const oldImage = blog.image;
    const oldTitle = blog.title;

    blog.title = title.trim();
    blog.content = content;
    blog.category = category;
    blog.tags = getTags(req.body.tags);
    blog.seoTitle = req.body.seoTitle || "";
    blog.metaDescription = req.body.metaDescription || "";

    const scheduledAt = req.body.scheduledAt || req.body.publishAt;

    if (scheduledAt) {
      const publishDate = new Date(scheduledAt);

      if (!Number.isNaN(publishDate.getTime())) {
        blog.publishAt = publishDate;
      }
    }

    if (req.body.status && ["draft", "scheduled", "published"].includes(req.body.status)) {
      blog.status = req.body.status;

      if (req.body.status === "published") {
        blog.publishAt = new Date();
      }

      if (req.body.status === "scheduled" && req.body.scheduledAt) {
        const scheduledDate = new Date(req.body.scheduledAt);

        if (!Number.isNaN(scheduledDate.getTime()) && scheduledDate > new Date()) {
          blog.publishAt = scheduledDate;
        } else {
          return sendError(res, 400, "Scheduled time must be in the future", newImage);
        }
      }
    }

    if (title.trim() !== oldTitle || !blog.slug) {
      blog.slug = await generateUniqueSlug(title, blog._id);
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
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const blog = await Post.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const isOwner = blog.author.toString() === req.user.id;

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot delete this blog" });
    }

    await blog.deleteOne();
    removeImage(blog.image);

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/upload-image", authMiddleware, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select an image"
            });
        }

        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        res.status(200).json({
            message: "Image uploaded successfully",
            url: imageUrl
        });
    } catch (err) {
        res.status(500).json({
            message: "Image upload failed"
        });
    }
});
module.exports = router;





