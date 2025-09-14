const express = require('express');
const {
  getProfile,
  updateProfile,
  deleteAccount,
  uploadAvatar,
  getWallet,
  getTransactions,
} = require('../controllers/userController');
const { protect } = require('../controllers/authController');
const { upload } = require('../utils/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.delete('/account', deleteAccount);
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);

// Wallet routes
router.get('/wallet', getWallet);
router.get('/transactions', getTransactions);

module.exports = router;