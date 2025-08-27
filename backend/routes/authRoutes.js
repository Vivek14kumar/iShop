import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // check if user exists with email OR mobile
    const exists = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "User with email or mobile already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, mobile, password: hashed });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Login user (email OR mobile)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // "identifier" = email OR mobile

    // find by email OR mobile
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }],
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

//Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { emailOrMobile, password, confirmPassword } = req.body;

    if (!emailOrMobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user by email OR mobile
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
