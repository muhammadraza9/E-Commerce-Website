const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const dbUrl = new URL(process.env.DATABASE_URL);

const caCert = fs.readFileSync(path.join(__dirname, "ca.pem")).toString();

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  ssl: {
    ca: caCert,
  },
});

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;