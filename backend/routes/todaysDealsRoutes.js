// routes/todaysDeals.js
import express from "express";
import multer from "../middleware/upload.js";
import TodayDeal from "../models/todaysDeal.js";
import Product from "../models/product.js"; // import your product model

const router = express.Router();

// Generate unique Deal ID (TDE0001 format)
async function generateDealId() {
  const lastDeal = await TodayDeal.findOne().sort({ createdAt: -1 });
  if (!lastDeal) return "TDE0001";
  const lastIdNum = parseInt(lastDeal.dealId.slice(3)) + 1;
  return `TDE${String(lastIdNum).padStart(4, "0")}`;
}

// Get single deal by dealId (populate product)
router.get("/:dealId", async (req, res) => {
  try {
    const deal = await TodayDeal.findOne({ dealId: req.params.dealId })
      .populate("product"); // get full product details

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


// Get all deals (populate product)
router.get("/", async (req, res) => {
  try {
    const deals = await TodayDeal.find()
      .sort({ createdAt: -1 })
      .populate("product", "name category price stock image"); // show product details
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Add deal
router.post("/", multer.single("image"), async (req, res) => {
  try {
    const dealId = await generateDealId();

    let title = req.body.title;
    let price = Number(req.body.price);
    let discount = Number(req.body.discount);
    let stock = req.body.stock;
    let category = req.body.category;
    let image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    let product = null;
    if (req.body.productId) {
      product = await Product.findById(req.body.productId);
      if (product) {
        title = product.name;
        price = product.price;
        stock = product.stock;
        category = product.category;
        image = product.image;
      }
    }

    const finalPrice = price - (price * discount) / 100; // <-- calculate finalPrice

    const newDeal = new TodayDeal({
      dealId,
      product: product ? product._id : null,
      title,
      category,
      price,
      discount,
      finalPrice, // <-- save it here
      stock,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: req.body.status || "active",
      image,
    });

    const saved = await newDeal.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update deal
router.put("/:id", multer.single("image"), async (req, res) => {
  try {
    let updateData = {
      title: req.body.title,
      price: req.body.price,
      discount: req.body.discount,
      stock: req.body.stock,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: req.body.status,
    };

    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    // If productId is passed, refresh from product
    if (req.body.productId) {
      const product = await Product.findById(req.body.productId);
      if (product) {
        updateData.product = product._id;
        updateData.title = product.name;
        updateData.price = product.price;
        updateData.stock = product.stock;
        updateData.image = product.image;
      }
    }

    const updated = await TodayDeal.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete deal
router.delete("/:id", async (req, res) => {
  try {
    await TodayDeal.findByIdAndDelete(req.params.id);
    res.json({ message: "Deal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
