import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/images/temps')
    },
    filename: function (req, file, cb) {
        cb(null, + Date.now() + '-' + file.originalname)
    }
})


const upload = multer({ storage: storage })


// Middleware for single image upload
export const uploadSingleImage = upload.single('image');

// Middleware for multiple image uploads (optional)
export const uploadMultipleImages = upload.array('images', 10); // Limit to 5 images at a time (adjust as needed)