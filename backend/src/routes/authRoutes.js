const express = require("express");
const multer = require("multer");

const router = express.Router();

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

const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

const profileImageUpload = require(
  "../middleware/profileImageUpload"
);

// ==========================
// Profile Image Upload Handler
// ==========================

const uploadProfileImage = (req, res, next) => {
  profileImageUpload.single("profileImage")(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message:
              "Profile image must be smaller than 10MB.",
          });
        }

        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(400).json({
        message:
          error.message ||
          "Invalid profile image upload.",
      });
    }
  );
};

// ==========================
// Public Auth Routes
// ==========================

router.post("/register", register);

router.post("/login", login);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

// ==========================
// Logged-in User Routes
// ==========================

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

// ==========================
// Admin User Routes
// ==========================

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

module.exports = router;