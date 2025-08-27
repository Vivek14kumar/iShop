import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },

    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        dealId: { type:String,default: null }, // optional
        productName: { type: String, required: true },
        productImage: { type: String },
        productCategory: { type: String },
        price: { type: Number, required: true },       // final price (deal price if deal applied)
        originalPrice: { type: Number },              // product original price
        discount: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
      },
    ],

    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    paymentMethod: { type: String, required: true },
    status: { type: String, default: "Pending" },
    cancelledBy: { type: String, enum: ["User", "Admin"], default: null },
  },
  { timestamps: true }
);

// 🔹 Function to generate random alphanumeric ID
function generateOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORD";
  const length = Math.floor(Math.random() * 3) + 5; // 5–7 random chars → total 8–10
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 🔹 Pre-save hook with uniqueness check
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    let newOrderId;
    let exists = true;

    // Keep generating until unique
    while (exists) {
      newOrderId = generateOrderId();
      const existing = await mongoose.models.Order.findOne({ orderId: newOrderId });
      if (!existing) exists = false;
    }

    this.orderId = newOrderId;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
