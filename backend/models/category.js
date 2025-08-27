import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoryId: { type: String, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
});

export default mongoose.model("Category", categorySchema);
