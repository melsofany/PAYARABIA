const express = require('express');
const {
  // Auth
  adminLogin,
  adminLogout,
  getAdminProfile,
  updateAdminProfile,
  
  // Dashboard
  getDashboardStats,
  getRecentTransactions,
  
  // Users
  getUsers,
  getUser,
  updateUser,
  blockUser,
  unblockUser,
  
  // Support
  getTickets,
  getTicket,
  updateTicketStatus,
  addTicketMessage,
  assignTicket,
  
  // Finance
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  getExchangeRates,
  updateExchangeRate,
  getCommissionSettings,
  updateCommissionSettings,
  
  // Voice calls
  initiateVoiceCall,
  endVoiceCall,
  
  // Reports
  generateReport,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Public admin routes
router.post('/auth/login', adminLogin);

// Protected admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Auth
router.post('/auth/logout', adminLogout);
router.get('/profile', getAdminProfile);
router.patch('/profile', updateAdminProfile);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/transactions/recent', getRecentTransactions);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

// Support
router.get('/support/tickets', getTickets);
router.get('/support/tickets/:id', getTicket);
router.patch('/support/tickets/:id', updateTicketStatus);
router.post('/support/tickets/:id/messages', addTicketMessage);
router.post('/support/tickets/:id/assign', assignTicket);

// Finance
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransaction);
router.patch('/transactions/:id', updateTransactionStatus);
router.get('/finance/exchange-rates', getExchangeRates);
router.put('/finance/exchange-rates', updateExchangeRate);
router.get('/finance/commission', getCommissionSettings);
router.put('/finance/commission', updateCommissionSettings);

// Voice calls
router.post('/support/voice-call/initiate', initiateVoiceCall);
router.post('/support/voice-call/:callId/end', endVoiceCall);

// Reports
router.post('/reports/generate', generateReport);

module.exports = router;