const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

console.log("DB FILE LOADED");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const dbUrl = new URL(process.env.DATABASE_URL);

console.log("HOST:", dbUrl.hostname);
console.log("PORT:", dbUrl.port);

const certPath = path.join(__dirname, "ca.pem");

console.log("CA EXISTS:", fs.existsSync(certPath));

const caCert = fs.readFileSync(certPath, "utf8");

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace("/", ""),
  ssl: {
    ca: caCert,
  },
  connectTimeout: 60000,
});

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;