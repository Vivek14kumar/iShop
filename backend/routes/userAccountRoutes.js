import express from "express";
import User from "../models/user.js";

const router = express.Router();

// GET user by ID

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE account settings (name, mobile)

router.put("/account/:id", async (req, res) => {
  const { id } = req.params;
  const { name, mobile } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error("UPDATE account error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD new address

router.post("/:id/addresses", async (req, res) => {
  const { id } = req.params;
  const newAddress = req.body; // label, addressLine, city, state, pincode, mobile

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure each address has a unique _id
    user.addresses.push(newAddress);
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("ADD address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// EDIT existing address

router.put("/:id/addresses/:addressId", async (req, res) => {
  const { id, addressId } = req.params;
  const updatedAddress = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (index === -1) return res.status(404).json({ message: "Address not found" });

    user.addresses[index] = { ...user.addresses[index]._doc, ...updatedAddress };
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("EDIT address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE address

router.delete("/:id/addresses/:addressId", async (req, res) => {
  const { id, addressId } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("DELETE address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
