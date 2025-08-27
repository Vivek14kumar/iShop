// models/todaysDeal.js
import mongoose from "mongoose";

const todaysDealSchema = new mongoose.Schema(
  {
    dealId: { type: String, unique: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: true },
    finalPrice: { type: Number, required: true }, // <-- new field
    stock: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "upcoming", "expired"], default: "active" },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("TodayDeal", todaysDealSchema);
