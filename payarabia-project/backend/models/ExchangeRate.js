const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  fromCurrency: {
    type: String,
    required: true,
    enum: ['SAR', 'USD', 'EUR', 'USDT'],
  },
  toCurrency: {
    type: String,
    required: true,
    enum: ['SAR', 'USD', 'EUR', 'USDT'],
  },
  rate: {
    type: Number,
    required: true,
    min: [0, 'سعر الصرف لا يمكن أن يكون سالباً'],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'api', 'blockchain'],
    default: 'manual',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index to ensure unique currency pairs
exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);