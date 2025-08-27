import express from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import TodayDeal from "../models/todaysDeal.js";

const router = express.Router();

// Place a new order (multi-item, deal or normal product)
router.post("/", async (req, res) => {
  try {
    const { userId, userEmail, cartItems, shippingAddress, paymentMethod, status } = req.body;

    if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty or user missing" });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ message: "Incomplete shipping address" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const orderItems = [];

    for (const item of cartItems) {
      const { productId, dealId, quantity } = item;

      // Fetch product
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: `Product ${productId} not found` });

      // Check if enough stock is available
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }

      let price = product.price;
      let discount = 0;
      let title = product.name;
      let image = product.image;
      let deal = null;

      // If dealId is provided, fetch deal info
      if (dealId) {
        deal = await TodayDeal.findOne({dealId});
        if (!deal) return res.status(404).json({ message: `Deal ${dealId} not found` });
        const disPrice = Math.round(deal.finalPrice)
        price = disPrice ;
        discount = deal.discount;
        title = deal.title;
        image = deal.image;
      }

      // Deduct stock
      product.stock -= quantity;
      if (product.stock < 0) product.stock = 0; // just in case
      await product.save();

      orderItems.push({
        productId: product._id,
        dealId: deal ? deal.dealId : null,
        productName: title,
        productImage: image,
        productCategory: product.category,
        price,
        originalPrice: product.price,
        discount,
        quantity: quantity || 1,
        totalAmount: price * (quantity || 1),
      });
    }

    const newOrder = new Order({
      userId,
      userEmail,
      cartItems: orderItems,
      shippingAddress,
      paymentMethod,
      status: status || "Pending",
    });

    const savedOrder = await newOrder.save();

    //  Socket.IO notifications
    const io = req.app.locals.io;
    if (io) {
      // Notify admins
      io.emit("notification", {
        type: "orderCreated",
        message: `New order placed by ${userEmail}`,
        order: savedOrder,
      });

      // Notify the user
      io.to(userId.toString()).emit("notification", {
        type: "orderCreated",
        message: "Your order has been placed successfully!",
        order: savedOrder,
      });
    }

    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
});

//  Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get orders by user email
router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    if (!orders.length) return res.status(404).json({ message: "No orders found" });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//  Get single order by orderId
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId })
      .populate("cartItems.productId")
      .populate("cartItems.dealId")
      .populate("userId");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("Fetch order error:", err);
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
});

//  Update order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app.locals.io;
    if (io) {
      // Notify admins
      io.emit("notification", {
        type: "orderUpdated",
        message: `Order #${order.orderId} status updated to ${status}`,
        order,
      });

      // Notify user
      io.to(order.userId.toString()).emit("notification", {
        type: "orderUpdated",
        message: ` Your order #${order.orderId} status is now "${status}"`,
        order,
      });
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Error updating status" });
  }
});

// Cancel order
router.put("/:id/cancel", async (req, res) => {
  try {
    // Find by orderId instead of MongoDB _id
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Delivered orders cannot be cancelled" });
    }

    order.status = "Cancelled";
    order.cancelledBy = "User";
    await order.save();

    //  Emit silent reload event (no notification message)
    const io = req.app.locals.io;
    if (io) {
      io.emit("orderReload", { orderId: order.orderId, status: "Cancelled" });
    }

    res.json(order);
  } catch (err) {
    console.error("Cancel Order Error:", err); // log error
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


//  Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Pending" && order.status !== "Ordered") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    await Order.findByIdAndDelete(req.params.id);

    const io = req.app.locals.io;
    if (io) {
      io.emit("notification", {
        type: "orderCancelled",
        message: `Order #${order.orderId} has been cancelled`,
        orderId: order._id,
      });

      io.to(order.userId.toString()).emit("notification", {
        type: "orderCancelled",
        message: " Your order has been cancelled",
        orderId: order._id,
      });
    }

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
});

export default router;
