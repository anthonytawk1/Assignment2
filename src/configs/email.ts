export default {
  host: process.env.EMAIL_HOST || "",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
  emails: {
    forgotPassword: {
      subject: "Forgot Password",
      body: "Hello, if you requested for a password rest please use the following one time password {otp} to rest your password",
    },
  },
};
