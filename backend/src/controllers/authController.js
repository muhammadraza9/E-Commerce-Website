const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 4 || password.length > 9) {
      return res.status(400).json({
        message: "Password must be 4 to 9 characters",
      });
    }

    const exists = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
    });

    const { password: userPassword, resetOtp, resetOtpExpiry, ...safeUser } =
      user;

    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: userPassword, resetOtp, resetOtpExpiry, ...safeUser } =
      user;

    res.json({
      token,
      role: user.role,
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - Style Avenue",
      html: `
        <div style="font-family:Arial,sans-serif;background:#0B1F33;padding:30px;color:#ffffff;">
          <div style="max-width:600px;margin:auto;background:#081421;border:1px solid #D4AF37;border-radius:14px;padding:30px;">
            <h1 style="color:#D4AF37;margin-bottom:10px;">Style Avenue</h1>
            <h2>Password Reset OTP</h2>
            <p>Hello <strong>${user.username}</strong>,</p>
            <p>Your password reset OTP is:</p>
            <div style="font-size:34px;letter-spacing:8px;color:#D4AF37;font-weight:bold;margin:24px 0;">
              ${otp}
            </div>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 4 || newPassword.length > 9) {
      return res.status(400).json({
        message: "Password must be 4 to 9 characters",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        resetOtp: otp.trim(),
        resetOtpExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Password reset failed",
      error: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Username is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username: username.trim() },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Profile update failed",
      error: err.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 4 || newPassword.length > 9) {
      return res.status(400).json({
        message: "New password must be 4 to 9 characters",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Password change failed",
      error: err.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load users",
      error: err.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const { role } = req.body;

    if (!targetUserId || Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (Number(req.user.id) === targetUserId) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.role === role) {
      return res.json({
        message: "User role is already updated",
        user: existingUser,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user role",
      error: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);

    if (!targetUserId || Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (Number(req.user.id) === targetUserId) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete user",
      error: err.message,
    });
  }
};