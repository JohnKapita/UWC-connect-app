import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: process.env.SMTP_EMAIL, // send to yourself
      subject: "Test OTP Email",
      text: "This is a test email from UWC Connect backend.",
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
}

testEmail();
