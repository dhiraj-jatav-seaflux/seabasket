import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  connectionTimeout: 5000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to:string,otp:string){
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "SeaBasket Login OTP",
    html: `
      <h2>Your OTP Code</h2>
      <p>Your login OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });
}

export async function sendResetEmail(to: string, token: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "SeaBasket Password Reset",
    html: `
      <div style="font-family: Arial; padding:20px">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password.</p>

        <a href="${process.env.FRONTEND_URL}/reset/${token}"
           style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>

        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}