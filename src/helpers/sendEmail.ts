import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, otp: string) {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM!, 
      subject: "SeaBasket Login OTP",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your login OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    const response = await sgMail.send(msg);
    console.log("OTP email sent:", response[0].statusCode);
  } catch (err: any) {
    console.error("Failed to send OTP email:", err.response?.body || err.message);
  }
}

export async function sendResetEmail(to: string, token: string) {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM!,
      subject: "SeaBasket Password Reset",
      html: `
        <div style="font-family: Arial; padding:20px">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${process.env.FRONTEND_URL}/reset/${token}"
             style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
             Reset Password
          </a>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    };

    const response = await sgMail.send(msg);
    console.log("Reset email sent:", response[0].statusCode);
  } catch (err: any) {
    console.error("Failed to send reset email:", err.response?.body || err.message);
  }
}