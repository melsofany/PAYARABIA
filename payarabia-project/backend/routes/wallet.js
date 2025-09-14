const express = require('express');
const {
  getBalance,
  transferMoney,
  getTransactions,
  getExchangeRates,
  exchangeCurrency,
  depositMoney,
  withdrawMoney,
} = require('../controllers/walletController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Balance and transactions
router.get('/balance', getBalance);
router.get('/transactions', getTransactions);

// Money operations
router.post('/transfer', transferMoney);
router.post('/deposit', depositMoney);
router.post('/withdraw', withdrawMoney);

// Currency exchange
router.get('/exchange-rates', getExchangeRates);
router.post('/exchange', exchangeCurrency);

module.exports = router;