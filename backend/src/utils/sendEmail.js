const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log("✅ Email Sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email Failed:", err.message);
    throw err; // taake order controller ko bhi pata chale ke email fail hui
  }
};

module.exports = sendEmail;