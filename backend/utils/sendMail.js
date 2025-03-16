require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
    {
        host: "smtp.gmail.com",
        port: 465,
        secure: true, 
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    })


    const sendVerificationEmail = async (email, token) => {
      const verificationLink = `http://localhost:5000/api/user/verify-email?token=${token}`;

      const mailOptions = {
        from: process.env.USER,
        to: email,
        subject: "Verify Your Email",
        html: `
      <h2>Welcome!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}" style="color: blue; font-size: 16px;">Verify Email</a>
    `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };

    module.exports = sendVerificationEmail;