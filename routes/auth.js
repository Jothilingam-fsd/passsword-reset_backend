import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendResetEmail } from '../utils/email.js';
const router = express.Router();

/**
 * POST /register
 * Request body: { email, password }
 */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
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
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
      });
    }

    const emailLower = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const newUser = new User({
      fullName: fullName.trim(),
      email: emailLower,
      password: password, 
    });

    await newUser.save(); 

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /login
 * Request body: { email, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const emailTrimmed = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailTrimmed });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});


/**
 * POST /forgot-password
 * Request body: { email }
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link will be sent' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpire = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    await sendResetEmail(user.email, resetToken);

    return res.json({ success: true, message: 'Password reset email sent if account exists' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /reset-password/:token
 * Validate token
 */
router.get('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
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
 * Request body: { password }
 */
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (
      !password ||
      typeof password !== 'string' ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
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

    user.password = password; // hashed automatically by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
