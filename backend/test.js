const prisma = require("./src/config/db");

async function test() {
  try {
    await prisma.$connect();
    console.log("Database Connected Successfully !");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();