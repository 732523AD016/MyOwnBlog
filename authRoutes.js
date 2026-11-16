const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");
const router=express.Router();
router.post("/register", async (req, res) => {
    try {
        const {name, email, password }=req.body;

        if (!name||!email||!password){
            return res.status(400).json({ message: "All fields are required" });}
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });}
        const oldUser = await User.findOne({ email: email.toLowerCase() });
        if (oldUser) {
            return res.status(400).json({ message: "Email already registered" });}
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword });
 res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });}
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email||!password) {
            return res.status(400).json({ message: "Email and password are required" });}
    const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Wrong email or password" });}
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong email or password" });
        }
 const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
  res.json({
            token: token,
            user: { _id: user._id, name: user.name, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });}
});

module.exports=router;