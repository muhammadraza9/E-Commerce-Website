const multer = require("multer");

// ==========================================
// Multer Memory Storage
// ==========================================
// Files are kept in memory so their buffer can be
// uploaded directly to Cloudinary.

const storage = multer.memoryStorage();

// ==========================================
// Allowed Image MIME Types
// ==========================================

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// ==========================================
// Image File Filter
// ==========================================

const fileFilter = (req, file, callback) => {
  if (!allowedImageTypes.has(file.mimetype)) {
    return callback(
      new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."),
      false
    );
  }

  callback(null, true);
};

// ==========================================
// Product Image Upload Middleware
// ==========================================

const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

module.exports = productImageUpload;