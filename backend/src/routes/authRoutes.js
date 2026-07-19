const express = require("express");
const multer = require("multer");

const router = express.Router();

// ==========================================
// Controllers
// ==========================================

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/authController");

// ==========================================
// Authentication Middleware
// ==========================================

const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

// ==========================================
// Image Upload Middleware
// ==========================================
// Reusing the existing Multer middleware for profile images.

const profileImageUpload = require("../middleware/productImageUpload");

// ==========================================
// Profile Image Upload Error Handler
// ==========================================

const uploadProfileImage = (req, res, next) => {
  const upload = profileImageUpload.single("profileImage");

  upload(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Profile image must be smaller than 5MB.",
        });
      }

      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message:
            'Only one profile image is allowed using the field name "profileImage".',
        });
      }

      return res.status(400).json({
        message: error.message || "Profile image upload failed.",
      });
    }

    return res.status(400).json({
      message: error.message || "Invalid profile image upload.",
    });
  });
};

// ==========================================
// Public Authentication Routes
// ==========================================

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

// ==========================================
// Authenticated User Routes
// ==========================================

router.put(
  "/profile",
  verifyToken,
  uploadProfileImage,
  updateProfile
);

router.put(
  "/change-password",
  verifyToken,
  changePassword
);

// ==========================================
// Admin User Management Routes
// ==========================================

router.get(
  "/users",
  verifyToken,
  verifyAdmin,
  getAllUsers
);

router.patch(
  "/users/:id/role",
  verifyToken,
  verifyAdmin,
  updateUserRole
);

router.delete(
  "/users/:id",
  verifyToken,
  verifyAdmin,
  deleteUser
);

// ==========================================
// Export Router
// ==========================================

module.exports = router;