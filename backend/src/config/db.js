const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const dbUrl = new URL(process.env.DATABASE_URL);

const caPath = path.join(__dirname, "ca.pem");

// ===============================
// Reuse Prisma Client across serverless invocations (warm starts)
// Prevents exhausting Aiven's limited connection pool
// ===============================

const globalForPrisma = globalThis;

let prisma;

if (!globalForPrisma.__prisma) {
  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace("/", ""),
    ssl: {
      ca: fs.readFileSync(caPath, "utf8"),
      rejectUnauthorized: true,
    },
    connectionLimit: 3, // keep low — Aiven free tier has limited max connections
    acquireTimeout: 15000, // wait a bit longer for DB to wake up from auto-pause
  });

  globalForPrisma.__prisma = new PrismaClient({
    adapter,
  });
}

prisma = globalForPrisma.__prisma;

module.exports = prisma;