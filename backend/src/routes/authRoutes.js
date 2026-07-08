const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Public Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// User Profile Routes
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Admin Only Routes
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.patch("/users/:id/role", verifyToken, verifyAdmin, updateUserRole);
router.delete("/users/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;