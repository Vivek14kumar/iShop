import express from "express"
import multer from 'multer';
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig";

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "carspa",
    format: async (req, file) => "jpeg",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
  res.json({ url: req.file.path }); // Cloudinary HTTPS URL
});

// Store in /uploads and rename with timestamp

/*const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});*/

export default upload;
