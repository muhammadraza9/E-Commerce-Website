require("dotenv").config();
const prisma = require("./src/config/db");

async function main() {
  const updated = await prisma.user.update({
    where: { email: "officialmohammadraza110@gmail.com" },
    data: { role: "ADMIN" },
  });
  console.log("✅ User updated:", updated);
}

main()
  .catch((e) => console.error("❌ Error:", e))
  .finally(() => prisma.$disconnect());