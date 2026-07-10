const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const createActivityLog = require("../utils/createActivityLog");

const PASSWORD_MIN = 4;
const PASSWORD_MAX = 9;
const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const validPassword = (password) =>
  password?.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX;

const logAdminAction = (req, data) =>
  createActivityLog({
    adminId: req.user?.id,
    adminEmail: req.user?.email,
    ...data,
  });

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!username?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validPassword(password)) {
      return res.status(400).json({
        message: "Password must be 4 to 9 characters",
      });
    }

    const exists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
      },
      select: USER_SELECT,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, resetOtp, resetOtpExpiry, ...safeUser } = user;

    if (user.role === "ADMIN") {
      await createActivityLog({
        adminId: user.id,
        adminEmail: user.email,
        action: "LOGIN",
        entity: "AUTH",
        entityId: user.id,
        message: `Admin "${user.email}" logged in`,
      });
    }

    res.json({
      token,
      role: user.role,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - Style Avenue",
      html: `
        <div style="font-family:Arial;background:#0B1F33;padding:30px;color:#fff">
          <div style="max-width:600px;margin:auto;background:#081421;border:1px solid #D4AF37;border-radius:14px;padding:30px">
            <h1 style="color:#D4AF37">Style Avenue</h1>
            <h2>Password Reset OTP</h2>
            <p>Hello <strong>${user.username}</strong>,</p>
            <p>Your password reset OTP is:</p>
            <div style="font-size:34px;letter-spacing:8px;color:#D4AF37;font-weight:bold;margin:24px 0">
              ${otp}
            </div>
            <p>This OTP expires in <strong>10 minutes</strong>.</p>
          </div>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
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

    if (!validPassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be 4 to 9 characters",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: normalizeEmail(email),
        resetOtp: otp.trim(),
        resetOtpExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(newPassword, 10),
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const username = req.body.username?.trim();

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: { username },
      select: USER_SELECT,
    });

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    if (!validPassword(newPassword)) {
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
      where: { id: Number(req.user.id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(newPassword, 10),
      },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Password change failed",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load users",
      error: error.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!id || !["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({
        message: "Invalid user ID or role",
      });
    }

    if (Number(req.user.id) === id) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existing.role === role) {
      return res.json({
        message: "User role is already updated",
        user: existing,
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: USER_SELECT,
    });

    await logAdminAction(req, {
      action: "UPDATE_ROLE",
      entity: "USER",
      entityId: user.id,
      message: `Changed "${user.email}" role from ${existing.role} to ${role}`,
    });

    res.json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (Number(req.user.id) === id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id },
    });

    await logAdminAction(req, {
      action: "DELETE",
      entity: "USER",
      entityId: user.id,
      message: `Deleted user "${user.email}"`,
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};