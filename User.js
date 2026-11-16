
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true},
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model("User", userSchema);
