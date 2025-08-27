import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

//  Function to generate ASIN-like ID starting with P
function generateProductId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const chars = letters + digits;

  let id = "P"; // Always start with P

  // Pattern: P + 2 digits + 5 random chars + 2 digits
  id += digits.charAt(Math.floor(Math.random() * digits.length));
  id += digits.charAt(Math.floor(Math.random() * digits.length));

  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  id += digits.charAt(Math.floor(Math.random() * digits.length));
  id += digits.charAt(Math.floor(Math.random() * digits.length));

  return id; // Example: P08XYZ1234
}

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      //required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String },
    rating: {type: Number, default: 4},
    description: { type: String, default: "" },
    aboutItems: { type: [String], default: [] },
    specifications: { type: [specificationSchema], default: [] },
  },
  { timestamps: true }
);

//  Pre-save hook to ensure unique productId
productSchema.pre("save", async function (next) {
  if (this.isNew && !this.productId) {
    let newId;
    let exists = true;

    while (exists) {
      newId = generateProductId();
      const existing = await mongoose.models.Product.findOne({ productId: newId });
      if (!existing) {
        exists = false;
      }
    }

    this.productId = newId;
  }
  next();
});

export default mongoose.model("Product", productSchema);
