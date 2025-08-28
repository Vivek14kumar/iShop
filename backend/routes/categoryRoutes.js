// routes/categoryRoutes.js
import express from "express";
import Category from "../models/category.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();
const upload = multer(); // memory storage

// Generate new category ID
async function generateCategoryId() {
  const lastCategory = await Category.findOne().sort({ categoryId: -1 });
  if (!lastCategory) return "CAT0001";

  const lastNumber = parseInt(lastCategory.categoryId.replace("CAT", ""), 10);
  const newNumber = lastNumber + 1;
  return `CAT${String(newNumber).padStart(4, "0")}`;
}

// Helper: upload to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "carspa" },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ categoryId: 1 });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Add category
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const categoryId = await generateCategoryId();
    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const category = new Category({
      categoryId,
      name: req.body.name,
      image: imageUrl,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update category
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let updatedData = { name: req.body.name };

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      updatedData.image = imageUrl;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
