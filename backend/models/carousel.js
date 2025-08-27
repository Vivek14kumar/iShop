import mongoose from "mongoose";

const carouselSchema = new mongoose.Schema({
  carouselId: { type: String, unique: true },
  title: { type: String, default: "" },
  image: { type: String, required: true }, // Image file path
}, { timestamps: true });

export default mongoose.model("Carousel", carouselSchema);
