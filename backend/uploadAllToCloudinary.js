import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Replace this schema with your product schema
const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  imageUrl: String,
}));

// Path to your local uploads folder
const uploadsDir = path.join(process.cwd(), "uploads");

// Read all files in the folder
fs.readdir(uploadsDir, async (err, files) => {
  if (err) return console.error("Error reading uploads folder:", err);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    
    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "carspa",
        public_id: path.parse(file).name,
      });

      console.log(`${file} uploaded:`, result.secure_url);

      // Optional: update in DB (example: match by local filename)
      const product = await Product.findOne({ imageUrl: `uploads/${file}` });
      if (product) {
        product.imageUrl = result.secure_url;
        await product.save();
        console.log(`Updated DB for product: ${product.name}`);
      }

    } catch (error) {
      console.error(`Error uploading ${file}:`, error);
    }
  }

  console.log("All images processed!");
  mongoose.disconnect();
});
