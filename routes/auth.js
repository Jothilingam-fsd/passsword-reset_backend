/**
 * routes/auth.js
 * 
 * Defines routes related to authentication and password reset flow.
 * Routes:
 *  POST /forgot-password - initiate password reset by email
 *  GET /reset-password/:token - validate password reset token
 *  POST /reset-password/:token - reset password with valid token
 */

import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendResetEmail } from '../utils/email.js';

const router = express.Router();

/**
 * POST /forgot-password
 * Request body: { email: string }
 * 
 * Checks if user exists, generates secure token and expiry,
 * stores them in DB, sends email with reset link.
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, do not reveal that email does not exist
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    // Generate secure random token (40 hex characters)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set expiry date 1 hour from now
    const resetExpire = Date.now() + 3600000; // 1 hour in ms

    // Save token and expiry to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;

    await user.save();

    // Send reset email with token
    await sendResetEmail(user.email, resetToken);

    return res.json({ success: true, message: 'Password reset email sent if account exists' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /reset-password/:token
 * 
 * Validates the token by checking existence and expiry date.
 * Responds with JSON indicating validity.
 */
router.get('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    return res.json({ success: true, message: 'Token is valid' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /reset-password/:token
 * Request body: { password: string }
 * 
 * Validates token, hashes new password, updates user password,
 * clears token and expiry, responds with success or error.
 */
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    if (
      !password ||
      typeof password !== 'string' ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      // Password must be at least 8 characters, include uppercase, lowercase, number, special char
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
