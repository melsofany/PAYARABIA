const express = require('express');
const {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe,
  protect,
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware are protected
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/update-password', updatePassword);

module.exports = router;