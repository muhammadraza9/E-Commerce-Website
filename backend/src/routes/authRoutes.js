const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/authController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Admin only routes
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.patch("/users/:id/role", verifyToken, verifyAdmin, updateUserRole);
router.delete("/users/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;