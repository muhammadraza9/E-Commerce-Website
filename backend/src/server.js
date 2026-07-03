const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", require("./routes/paymentRoutes"));

// ===============================
// TEMPORARY DEBUG ROUTE
// Tests a raw mysql2 connection, bypassing Prisma entirely.
// Remove this once the connection issue is diagnosed/fixed.
// ===============================
app.get("/api/test-db", async (req, res) => {
  const mysql = require("mysql2/promise");
  const dbUrl = new URL(process.env.DATABASE_URL);

  try {
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: Number(dbUrl.port),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace("/", ""),
      ssl: { rejectUnauthorized: true },
      connectTimeout: 20000,
    });

    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM product"
    );
    await connection.end();

    res.json({ success: true, count: rows[0].count });
  } catch (err) {
    res.json({ success: false, error: err.message, code: err.code });
  }
});

const PORT = process.env.PORT || 5000;

// Only listen locally — Vercel handles this via serverless export
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

// DATABASE_URL="mysql://root:Raza1234@localhost:3306/ecommerce_db"