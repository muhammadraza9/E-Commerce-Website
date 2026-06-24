const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const dbUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  allowPublicKeyRetrieval: true,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
});

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;