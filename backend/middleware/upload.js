// middleware/upload.js
import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";
import streamifier from "streamifier";

// Use memory storage (no local files)
const upload = multer();

// Pure helper function to upload file to Cloudinary
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("No file provided");

  console.log("Uploading file to Cloudinary:", file.originalname);

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "iShop" }, // optional folder
      (error, result) => {
        if (result) {
          //console.log("Cloudinary upload success:", result.secure_url);
          resolve(result.secure_url);
        } else {
          //console.error("Cloudinary upload error:", error);
          reject(error);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export default upload;
