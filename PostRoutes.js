const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
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
} = require("../controllers/PostController");
const router = express.Router();
router.get("/", getBlogs);
router.get("/trending", getTrendingBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/related/:id", getRelatedBlogs);
router.get("/adjacent/:id", getAdjacentBlogs);
router.get("/my", authMiddleware, getMyBlogs);
router.post("/upload-image", authMiddleware, upload.single("image"), uploadContentImage);
router.get("/:id/edit", authMiddleware, getBlogForEdit);
router.get("/:id", getBlogById);
router.post("/", authMiddleware, upload.single("image"), createBlog);
router.put("/:id", authMiddleware, upload.single("image"), updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);
module.exports = router;