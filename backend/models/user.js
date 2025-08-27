import mongoose from 'mongoose';

// Address Schema
const addressSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., "Home", "Office"
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
}, { _id: true });

// User Schema
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: [addressSchema], // embedded addresses
  },
  { timestamps: true }
);

// 🔑 Pre-save middleware to auto-generate userId
userSchema.pre("save", async function (next) {
  if (!this.userId) {
    // Example format: USR-20250819-XYZ123
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const datePart = new Date().toISOString().slice(0,10).replace(/-/g, "");
    this.userId = `USR-${datePart}-${random}`;
  }
  next();
});

export default mongoose.model("User", userSchema);
