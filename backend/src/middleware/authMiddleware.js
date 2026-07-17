const jwt = require("jsonwebtoken");

// ==========================
// Verify User Token
// ==========================

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.user = {
      id: Number(decoded.id),
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }
};

// ==========================
// Verify Admin
// ==========================

const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication is required",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }

  return next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
};