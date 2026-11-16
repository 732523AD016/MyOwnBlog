
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getUsers,
    deleteUser,
    getAllPosts,
    updatePostStatus,
    toggleFeatured
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

router.get("/posts", getAllPosts);
router.patch("/posts/:id/status", updatePostStatus);
router.patch("/posts/:id/featured", toggleFeatured);

module.exports = router;
