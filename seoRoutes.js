
const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;"
    };

    return entities[char];
  });
}

router.get("/sitemap.xml", async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({
        message: "Frontend URL is missing"
      });
    }

    const posts = await Post.find({
      status: "published",
      publishAt: { $lte: new Date() },
      slug: { $exists: true, $ne: "" }
    }).select("slug updatedAt");

    const urls = posts.map((post) => {
      return `
        <url>
          <loc>${escapeXml(
            `${frontendUrl}/blog/${post.slug}`
          )}</loc>
          <lastmod>${post.updatedAt.toISOString()}</lastmod>
        </url>
      `;
    }).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${escapeXml(frontendUrl)}</loc>
        </url>
        ${urls}
      </urlset>`;

    res.type("application/xml").send(sitemap);
  } catch (err) {
    res.status(500).json({ message: "Could not generate sitemap" });
  }
});

module.exports = router;
