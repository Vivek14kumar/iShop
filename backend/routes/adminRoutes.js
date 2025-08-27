// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../../models/order");

// GET Monthly stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
});


module.exports = router;
