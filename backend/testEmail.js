require("dotenv").config();
const nodemailer = require("nodemailer");


console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);
console.log("PASS LENGTH =", process.env.EMAIL_PASS?.length);

async function test() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify();

  console.log("SMTP Connected");
}

test().catch(console.error);