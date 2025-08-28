// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dg31yx2um",       // your Cloudinary cloud name
  api_key: "458694684366621",    // your Cloudinary API key
  api_secret: "7Ioop8Z17QLDWQJ2jXgkkEEHWwI", // your Cloudinary API secret
});

export default cloudinary;
