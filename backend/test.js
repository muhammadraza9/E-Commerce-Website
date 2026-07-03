require("dotenv").config();

const prisma = require("./src/config/db");

async function test() {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected Successfully!");

    const result = await prisma.$queryRaw`SELECT 1`;
    console.log(result);
  } catch (err) {
    console.error("❌ Database Error:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();