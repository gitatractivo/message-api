import nodemailer from "nodemailer";
import { logger } from "@/config/logger";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
      logger.error(
        "SendGrid credentials are missing. Please check your environment variables."
      );
      throw new Error("SendGrid credentials are missing");
    }

    // Use SendGrid SMTP settings
    this.transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
      debug: process.env.NODE_ENV === "development", // Enable debug logs in development
    });

    // Verify connection configuration
    this.transporter.verify((error: Error | null, success: boolean) => {
      if (error) {
        logger.error("SendGrid connection error:", error);
        throw new Error(`SendGrid connection failed: ${error.message}`);
      } else {
        logger.info("SendGrid server is ready to take our messages");
      }
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      // pass token in params not in quer

      const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email/${token}`;

      //add some button to click here to verify your email with blue button border radius 10px
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your email address",
        html: `
          <h1>Email Verification</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="background-color: blue; color: white; padding: 10px 20px; border-radius: 10px; text-decoration: none;">click here to verify your email</a>
          <p>This link will expire in 24 hours.</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(
        `Verification email sent to ${email}. Message ID: ${info.messageId}`
      );
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error("Failed to send verification email");
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Reset your password",
        html: `
          <h1>Password Reset</h1>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(
        `Password reset email sent to ${email}. Message ID: ${info.messageId}`
      );
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error("Failed to send password reset email");
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Welcome to our platform!",
        html: `
          <h1>Welcome ${name}!</h1>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>You can now start using all the features available to you.</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(
        `Welcome email sent to ${email}. Message ID: ${info.messageId}`
      );
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      throw new Error("Failed to send welcome email");
    }
  }
}

export const emailService = new EmailService();
