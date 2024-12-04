import nodemailer from "nodemailer";
import dotenv from 'dotenv';


dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Replace with your email
        pass: process.env.GMAIL_PASS,   // Replace with your email password
    },
});

export async function sendVerificationEmail(to: string, token: string) {
    const verificationLink = `${process.env.FRONTEND_URL}/authAccount?token=${token}`;
    const mailOptions = {
        from: 'ERP APP<' + process.env.GMAIL_USER + '>',
        to: to,
        subject: "Verify Your Account",
        html: `
            <h1>Welcome to ERP APP</h1>
            <p>Click the link below to verify your account:</p>
            <a href="${verificationLink}">Verify Account</a>
        `,
    };

    await transporter.sendMail(mailOptions);
}
