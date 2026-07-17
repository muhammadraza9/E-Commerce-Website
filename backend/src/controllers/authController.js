const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const createActivityLog = require(
  "../utils/createActivityLog"
);
const cloudinary = require("../config/cloudinary");

const PASSWORD_MIN = 4;
const PASSWORD_MAX = 9;

const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  role: true,
  profileImage: true,
  createdAt: true,
};

// ==========================
// Helpers
// ==========================

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const validPassword = (password) =>
  typeof password === "string" &&
  password.length >= PASSWORD_MIN &&
  password.length <= PASSWORD_MAX;

const parseBoolean = (value) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1";

const logAdminAction = (req, data) =>
  createActivityLog({
    adminId: req.user?.id,
    adminEmail: req.user?.email,
    ...data,
  });

// ==========================
// Cloudinary Upload
// ==========================

const uploadProfileImage = (
  buffer,
  userId
) =>
  new Promise((resolve, reject) => {
    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder:
            "style-avenue/profile-images",
          public_id: `user-${userId}-${Date.now()}`,
          resource_type: "image",
          overwrite: false,
          invalidate: true,
          transformation: [
            {
              width: 1000,
              height: 1000,
              crop: "limit",
              quality: "auto:best",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    stream.end(buffer);
  });

// ==========================
// Cloudinary Delete
// ==========================

const deleteCloudinaryImage = async (
  publicId
) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
        invalidate: true,
      }
    );
  } catch (error) {
    console.error(
      "Cloudinary delete warning:",
      error.message
    );
  }
};

// ==========================
// Register
// ==========================

exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    const normalizedEmail =
      normalizeEmail(email);

    if (
      !username?.trim() ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!validPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 4 to 9 characters",
      });
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user =
      await prisma.user.create({
        data: {
          username: username.trim(),
          email: normalizedEmail,
          password: await bcrypt.hash(
            password,
            10
          ),
        },
        select: USER_SELECT,
      });

    return res.status(201).json(user);
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ==========================
// Login
// ==========================

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage:
        user.profileImage || null,
      createdAt: user.createdAt,
    };

    if (user.role === "ADMIN") {
      await createActivityLog({
        adminId: user.id,
        adminEmail: user.email,
        action: "LOGIN",
        entity: "AUTH",
        entityId: String(user.id),
        message: `Admin "${user.email}" logged in`,
      });
    }

    return res.json({
      token,
      role: user.role,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==========================
// Forgot Password
// ==========================

exports.forgotPassword = async (
  req,
  res
) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetOtp: otp,
        resetOtpExpiry: new Date(
          Date.now() + 10 * 60 * 1000
        ),
      },
    });

    await sendEmail({
      to: user.email,
      subject:
        "Password Reset OTP - Style Avenue",
      html: `
        <div style="font-family:Arial;background:#0B1F33;padding:30px;color:#fff">
          <div style="max-width:600px;margin:auto;background:#081421;border:1px solid #D4AF37;border-radius:14px;padding:30px">
            <h1 style="color:#D4AF37">
              Style Avenue
            </h1>

            <h2>Password Reset OTP</h2>

            <p>
              Hello
              <strong>
                ${user.username}
              </strong>,
            </p>

            <p>
              Your password reset OTP is:
            </p>

            <div style="font-size:34px;letter-spacing:8px;color:#D4AF37;font-weight:bold;margin:24px 0">
              ${otp}
            </div>

            <p>
              This OTP expires in
              <strong>10 minutes</strong>.
            </p>
          </div>
        </div>
      `,
    });

    return res.json({
      message:
        "OTP sent to your email",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// ==========================
// Reset Password
// ==========================

exports.resetPassword = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (
      !email ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Email, OTP and new password are required",
      });
    }

    if (!validPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 4 to 9 characters",
      });
    }

    const user =
      await prisma.user.findFirst({
        where: {
          email: normalizeEmail(email),
          resetOtp: String(otp).trim(),
          resetOtpExpiry: {
            gt: new Date(),
          },
        },
      });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired OTP",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await bcrypt.hash(
          newPassword,
          10
        ),
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return res.json({
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message:
        "Password reset failed",
      error: error.message,
    });
  }
};

// ==========================
// Update Profile
// ==========================

exports.updateProfile = async (
  req,
  res
) => {
  let newUploadedPublicId = null;

  try {
    const userId = Number(
      req.user?.id
    );

    const username =
      req.body.username?.trim();

    const email = normalizeEmail(
      req.body.email
    );

    const removeProfileImage =
      parseBoolean(
        req.body.removeProfileImage
      );

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    if (!username || !email) {
      return res.status(400).json({
        message:
          "Username and email are required",
      });
    }

    if (
      removeProfileImage &&
      req.file
    ) {
      return res.status(400).json({
        message:
          "Upload and remove photo cannot be requested together",
      });
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          profileImage: true,
          profileImagePublicId: true,
        },
      });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingEmail =
      await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: userId,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingEmail) {
      return res.status(400).json({
        message:
          "Email is already in use",
      });
    }

    let profileImage =
      existingUser.profileImage;

    let profileImagePublicId =
      existingUser.profileImagePublicId;

    if (req.file) {
      const uploadResult =
        await uploadProfileImage(
          req.file.buffer,
          userId
        );

      newUploadedPublicId =
        uploadResult.public_id;

      profileImage =
        uploadResult.secure_url;

      profileImagePublicId =
        uploadResult.public_id;
    }

    if (removeProfileImage) {
      profileImage = null;
      profileImagePublicId = null;
    }

    const user =
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username,
          email,
          profileImage,
          profileImagePublicId,
        },
        select: USER_SELECT,
      });

    if (
      (req.file ||
        removeProfileImage) &&
      existingUser.profileImagePublicId &&
      existingUser.profileImagePublicId !==
        profileImagePublicId
    ) {
      await deleteCloudinaryImage(
        existingUser.profileImagePublicId
      );
    }

    return res.json({
      message: removeProfileImage
        ? "Profile updated and photo removed successfully"
        : req.file
          ? "Profile and photo updated successfully"
          : "Profile updated successfully",
      user,
    });
  } catch (error) {
    if (newUploadedPublicId) {
      await deleteCloudinaryImage(
        newUploadedPublicId
      );
    }

    console.error(
      "Profile update error:",
      error
    );

    return res.status(500).json({
      message:
        "Profile update failed",
      error: error.message,
    });
  }
};

// ==========================
// Change Password
// ==========================

exports.changePassword = async (
  req,
  res
) => {
  try {
    const {
      oldPassword,
      newPassword,
    } = req.body;

    const userId = Number(
      req.user?.id
    );

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    if (
      !oldPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Old password and new password are required",
      });
    }

    if (!validPassword(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 4 to 9 characters",
      });
    }

    if (
      oldPassword === newPassword
    ) {
      return res.status(400).json({
        message:
          "New password must be different from old password",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        oldPassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(400).json({
        message:
          "Old password is incorrect",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await bcrypt.hash(
          newPassword,
          10
        ),
      },
    });

    return res.json({
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      message:
        "Password change failed",
      error: error.message,
    });
  }
};

// ==========================
// Get All Users
// ==========================

exports.getAllUsers = async (
  req,
  res
) => {
  try {
    const users =
      await prisma.user.findMany({
        select: USER_SELECT,
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json(users);
  } catch (error) {
    console.error(
      "Get users error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load users",
      error: error.message,
    });
  }
};

// ==========================
// Update User Role
// ==========================

exports.updateUserRole = async (
  req,
  res
) => {
  try {
    const id = Number(
      req.params.id
    );

    const { role } = req.body;

    if (
      !id ||
      !["USER", "ADMIN"].includes(
        role
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid user ID or role",
      });
    }

    if (
      Number(req.user?.id) === id
    ) {
      return res.status(400).json({
        message:
          "You cannot change your own role",
      });
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id,
        },
        select: USER_SELECT,
      });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      existingUser.role === role
    ) {
      return res.json({
        message:
          "User role is already updated",
        user: existingUser,
      });
    }

    const user =
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          role,
        },
        select: USER_SELECT,
      });

    await logAdminAction(req, {
      action: "UPDATE_ROLE",
      entity: "USER",
      entityId: String(user.id),
      message: `Changed "${user.email}" role from ${existingUser.role} to ${role}`,
    });

    return res.json({
      message:
        "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Update user role error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update user role",
      error: error.message,
    });
  }
};

// ==========================
// Delete User
// ==========================

exports.deleteUser = async (
  req,
  res
) => {
  try {
    const id = Number(
      req.params.id
    );

    if (!id) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (
      Number(req.user?.id) === id
    ) {
      return res.status(400).json({
        message:
          "You cannot delete your own account",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          ...USER_SELECT,
          profileImagePublicId: true,
        },
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    if (
      user.profileImagePublicId
    ) {
      await deleteCloudinaryImage(
        user.profileImagePublicId
      );
    }

    await logAdminAction(req, {
      action: "DELETE",
      entity: "USER",
      entityId: String(user.id),
      message: `Deleted user "${user.email}"`,
    });

    return res.json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete user error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete user",
      error: error.message,
    });
  }
};