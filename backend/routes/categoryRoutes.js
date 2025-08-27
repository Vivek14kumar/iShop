// routes/categoryRoutes.js
import express from "express";
import Category from "../models/category.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Generate new category ID
async function generateCategoryId() {
  const lastCategory = await Category.findOne().sort({ categoryId: -1 });

  if (!lastCategory) {
    return "CAT0001";
  }

  const lastNumber = parseInt(lastCategory.categoryId.replace("CAT", ""), 10);
  const newNumber = lastNumber + 1;
  return `CAT${String(newNumber).padStart(4, "0")}`;
}

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

    const category = new Category({
      categoryId,
      name: req.body.name,
      image: req.file ? `/uploads/${req.file.filename}` : "",
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
    const updatedData = {
      name: req.body.name,
    };

    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
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
