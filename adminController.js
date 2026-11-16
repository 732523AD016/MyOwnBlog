
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
async function deleteUser(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });}
    const user = await User.findById(req.params.id);
if (!user) {
      return res.status(404).json({ message: "User not found" });}
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
async function getAllPosts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
const filter = {};
 if (req.query.status) {
   filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Post.countDocuments(filter)
    ]);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
async function updatePostStatus(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ message: "Invalid post status" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.status = status;

    if (status === "published" && post.publishAt > new Date()) {
      post.publishAt = new Date();
    }

    await post.save();

    res.json({
      message: "Post status updated successfully",
      post
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
async function toggleFeatured(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isFeatured = !post.isFeatured;

    await post.save();

    res.json({
      message: "Featured status updated successfully",
      isFeatured: post.isFeatured,
      post
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }}
module.exports = {
  getUsers,
  deleteUser,
  getAllPosts,
  updatePostStatus,
  toggleFeatured
};
