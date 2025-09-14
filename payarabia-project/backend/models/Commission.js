const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['local_transfer', 'international_transfer', 'currency_exchange', 'deposit', 'withdrawal'],
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  rate: {
    type: Number,
    required: true,
    min: [0, 'نسبة العمولة لا يمكن أن تكون سالبة'],
  },
  rateType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  minimumAmount: {
    type: Number,
    default: 0,
  },
  maximumAmount: Number,
  currency: {
    type: String,
    enum: ['SAR', 'USD', 'EUR', 'USDT'],
    default: 'SAR',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  applicableTo: [{
    type: String,
    enum: ['individual', 'business', 'premium'],
  }],
}, {
  timestamps: true,
});

// Index to ensure unique commission types
commissionSchema.index({ type: 1 }, { unique: true });

module.exports = mongoose.model('Commission', commissionSchema);