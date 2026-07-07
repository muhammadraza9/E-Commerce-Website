const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

/* ===========================
   CORS
=========================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://e-commerce-style-avenue.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===========================
   Middlewares
=========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===========================
   Health Check
=========================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Style Avenue Backend Running 🚀",
  });
});

/* ===========================
   API Routes
=========================== */

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payment", paymentRoutes);

/* ===========================
   404
=========================== */

app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

/* ===========================
   Error Handler
=========================== */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ===========================
   Start Server
=========================== */

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

module.exports = app;