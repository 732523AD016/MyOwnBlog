
const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tags = await Post.distinct("tags", {
      status: "published",
      publishAt: { $lte: new Date() }
    });

    res.json(tags.sort());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
