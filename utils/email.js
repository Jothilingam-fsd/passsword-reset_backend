/**
 * utils/email.js
 * 
 * Utility module to send password reset emails using Nodemailer.
 * Exports function sendResetEmail(email, token) that sends a styled HTML email.
 * Uses environment variables for SMTP configuration.
 */

import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FRONTEND_URL,
} = process.env;

/**
 * Sends a password reset email with a secure reset link containing the token.
 * The email uses Bootstrap styling and includes instructions.
 * 
 * @param {string} email - Recipient's email address
 * @param {string} token - Password reset token to embed in reset link
 * @returns {Promise<void>}
 */
export async function sendResetEmail(email, token) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FRONTEND_URL) {
    throw new Error('SMTP configuration and FRONTEND_URL must be set in environment variables');
  }

  // Create transporter with SMTP configuration
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Construct reset password URL with token as a query parameter
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

  // Compose HTML email with Bootstrap styling
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Password Reset</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    </head>
    <body>
      <div class="container py-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Password Reset Request</h3>
            <p>Hello,</p>
            <p>You are receiving this email because a password reset request for your account was received.</p>
            <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
            <div class="text-center my-4">
              <a href="${resetUrl}" class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">Reset Password</a>
            </div>
            <p>If you did not request a password reset, please ignore this email or contact support.</p>
            <hr />
            <p class="text-muted small">If the button above does not work, copy and paste the following link into your browser:</p>
            <p class="text-break"><a href="${resetUrl}">${resetUrl}</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: `"Support Team" <${SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
