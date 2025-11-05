import multer from "multer";

const memoryStorage = multer.memoryStorage();

const upload = multer({ storage: memoryStorage });

// Middleware for single image upload
export const uploadSingleImage = upload.single("image");

// Middleware for multiple image uploads (optional)
export const uploadMultipleImages = upload.array("images", 10); // Limit to 10 images at a time (adjust as needed)
