
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const seedCategories = require("./config/seedCategories");
const startScheduledPosts = require("./config/scheduledPosts");

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const seoRoutes = require("./routes/seoRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", blogRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/seo", seoRoutes);
app.get("/", (req, res) => {
  res.json({ message: "BlogSpace API is running" });
});
async function startServer() {
  try {
   await connectDB();

await seedCategories();

startScheduledPosts();

const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("Server startup failed:", err.message);
    process.exit(1);
  }}
startServer();
