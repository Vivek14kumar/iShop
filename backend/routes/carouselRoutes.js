import express from "express";
import Carousel from "../models/carousel.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Function to generate auto ID like CAR001, CAR002...
const generateCarouselId = async () => {
  const lastCarousel = await Carousel.findOne().sort({ carouselId: -1 });
  if (!lastCarousel) return "CAR001";
  
  const lastIdNum = parseInt(lastCarousel.carouselId.replace("CAR", ""));
  const newIdNum = lastIdNum + 1;
  return `CAR${String(newIdNum).padStart(3, "0")}`;
};

// @desc Get all carousels
router.get("/", async (req, res) => {
  try {
    const carousels = await Carousel.find().sort({ createdAt: -1 });
    res.json(carousels);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc Add new carousel
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const carouselId = await generateCarouselId();
    const newCarousel = new Carousel({
      carouselId,
      title: req.body.title,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    const savedCarousel = await newCarousel.save();
    res.status(201).json(savedCarousel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding carousel" });
  }
});

// @desc Update carousel
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
    };
    if (req.file) {
      updateData.image = `/uploads/carousels/${req.file.filename}`;
    }

    const updatedCarousel = await Carousel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCarousel) {
      return res.status(404).json({ message: "Carousel not found" });
    }

    res.json(updatedCarousel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating carousel" });
  }
});

// @desc Delete carousel
router.delete("/:id", async (req, res) => {
  try {
    const deletedCarousel = await Carousel.findByIdAndDelete(req.params.id);
    if (!deletedCarousel) {
      return res.status(404).json({ message: "Carousel not found" });
    }
    res.json({ message: "Carousel deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting carousel" });
  }
});

export default router;
