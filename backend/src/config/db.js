const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Raza1234",
  database: "ecommerce_db",
});

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;