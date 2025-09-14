const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'exchange', 'refund', 'commission'],
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
    min: [0.01, 'المبلغ يجب أن يكون أكبر من صفر'],
  },
  currency: {
    type: String,
    enum: ['SAR', 'USD', 'EUR', 'USDT'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  description: {
    type: String,
    maxlength: [500, 'الوصف لا يجب أن يتجاوز 500 حرف'],
  },
  // For transfers
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recipientName: String,
  recipientPhone: String,
  recipientEmail: String,
  // For exchanges
  exchangeRate: Number,
  fromCurrency: String,
  toCurrency: String,
  fromAmount: Number,
  toAmount: Number,
  // For deposits/withdrawals
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'stripe', 'usdt', 'cash'],
  },
  paymentReference: String,
  // For USDT transactions
  blockchain: {
    network: {
      type: String,
      enum: ['BEP20', 'ERC20', 'TRC20'],
      default: 'BEP20',
    },
    txHash: String,
    blockNumber: Number,
    gasUsed: Number,
    gasPrice: Number,
    fromAddress: String,
    toAddress: String,
    confirmations: {
      type: Number,
      default: 0,
    },
  },
  // Fees
  fees: {
    platform: {
      type: Number,
      default: 0,
    },
    network: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: {
      type: String,
      platform: String,
      version: String,
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
  },
  // Timestamps
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  failureReason: String,
  // Admin actions
  adminNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  reviewedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ transactionNumber: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'blockchain.txHash': 1 });
transactionSchema.index({ recipient: 1 });

// Virtual for transaction duration
transactionSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return this.completedAt - this.createdAt;
  }
  return null;
});

// Virtual for net amount (amount - fees)
transactionSchema.virtual('netAmount').get(function() {
  return this.amount - (this.fees.total || 0);
});

// Pre-save middleware to generate transaction number
transactionSchema.pre('save', async function(next) {
  if (!this.transactionNumber) {
    const count = await this.constructor.countDocuments();
    this.transactionNumber = `TXN-${Date.now()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate total fees
transactionSchema.pre('save', function(next) {
  if (this.fees.platform || this.fees.network) {
    this.fees.total = (this.fees.platform || 0) + (this.fees.network || 0);
  }
  next();
});

// Static method to get transaction statistics
transactionSchema.statics.getStats = async function(dateRange = {}) {
  const matchStage = {};
  
  if (dateRange.start || dateRange.end) {
    matchStage.createdAt = {};
    if (dateRange.start) matchStage.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) matchStage.createdAt.$lte = new Date(dateRange.end);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalVolume: { $sum: '$amount' },
        totalFees: { $sum: '$fees.total' },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        failedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        deposits: {
          $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0] }
        },
        withdrawals: {
          $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0] }
        },
        transfers: {
          $sum: { $cond: [{ $eq: ['$type', 'transfer'] }, '$amount', 0] }
        },
        exchanges: {
          $sum: { $cond: [{ $eq: ['$type', 'exchange'] }, '$amount', 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalTransactions: 0,
    totalVolume: 0,
    totalFees: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    deposits: 0,
    withdrawals: 0,
    transfers: 0,
    exchanges: 0
  };
};

// Static method to get transactions by type
transactionSchema.statics.getByType = function(type, limit = 10) {
  return this.find({ type })
    .populate('user', 'fullName email phone')
    .populate('recipient', 'fullName email phone')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get user transaction history
transactionSchema.statics.getUserHistory = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .populate('recipient', 'fullName email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get recent transactions
transactionSchema.statics.getRecent = function(limit = 10) {
  return this.find({ status: 'completed' })
    .populate('user', 'fullName email')
    .populate('recipient', 'fullName email')
    .sort({ completedAt: -1 })
    .limit(limit);
};

// Instance method to update status
transactionSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  switch (status) {
    case 'processing':
      this.processedAt = new Date();
      break;
    case 'completed':
      this.completedAt = new Date();
      break;
    case 'failed':
      this.failedAt = new Date();
      this.failureReason = additionalData.reason;
      break;
  }
  
  if (additionalData.adminNotes) {
    this.adminNotes = additionalData.adminNotes;
  }
  
  return this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema);