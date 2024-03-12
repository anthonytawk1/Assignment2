import nodemailer from "nodemailer";
import emailConfig from "../configs/email";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(options: EmailOptions): Promise<string> {
  try {
    // Create a Nodemailer transporter using SMTP transport
    const transporter = nodemailer.createTransport(emailConfig);
    // Setup email data
    const mailOptions = {
      from: "anthonytawk1@outlook.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
}
