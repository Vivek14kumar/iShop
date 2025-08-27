import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

const router = express.Router();

// Get all users (exclude password)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, role, mobile, addresses } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.mobile = mobile || user.mobile;

    // Handle addresses safely
    user.addresses = addresses.map(addr => {
      if (addr._id && addr._id.length === 24) {
        // Existing address, keep ObjectId
        return { ...addr };
      } else {
        // New address, let MongoDB generate _id
        const { _id, ...rest } = addr;
        return { ...rest };
      }
    });

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});


// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// POST /api/users/:id/reset-password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password reset failed" });
  }
});


export default router;
