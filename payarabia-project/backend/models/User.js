const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'الاسم الكامل مطلوب'],
    trim: true,
    maxlength: [100, 'الاسم الكامل لا يجب أن يتجاوز 100 حرف'],
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'يرجى إدخال بريد إلكتروني صحيح'],
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^(\+966|0)?[5-9][0-9]{8}$/.test(v);
      },
      message: 'يرجى إدخال رقم هاتف سعودي صحيح',
    },
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false, // Don't include password in queries by default
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'تاريخ الميلاد مطلوب'],
    validate: {
      validator: function(v) {
        const age = (new Date() - v) / (1000 * 60 * 60 * 24 * 365);
        return age >= 18;
      },
      message: 'يجب أن يكون العمر 18 سنة على الأقل',
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  status: {
    type: String,
    enum: ['active', 'blocked', 'pending'],
    default: 'pending',
  },
  blockedReason: String,
  blockedAt: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: [0, 'الرصيد لا يمكن أن يكون سالباً'],
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR'],
    },
  },
  usdtWallet: {
    address: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'رصيد USDT لا يمكن أن يكون سالباً'],
    },
    privateKey: {
      type: String,
      select: false, // Never include in queries
    },
  },
  profile: {
    avatar: String,
    nationalId: {
      type: String,
      unique: true,
      sparse: true,
    },
    address: {
      street: String,
      city: String,
      region: String,
      postalCode: String,
      country: {
        type: String,
        default: 'SA',
      },
    },
    occupation: String,
    monthlyIncome: {
      type: String,
      enum: ['less_than_5000', '5000_10000', '10000_20000', 'more_than_20000'],
    },
  },
  preferences: {
    language: {
      type: String,
      default: 'ar',
      enum: ['ar', 'en'],
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR'],
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
  },
  kyc: {
    status: {
      type: String,
      enum: ['not_started', 'pending', 'approved', 'rejected'],
      default: 'not_started',
    },
    documents: [{
      type: {
        type: String,
        enum: ['national_id', 'passport', 'utility_bill', 'bank_statement'],
      },
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    rejectionReason: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'usdtWallet.address': 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.profile.address) return '';
  const addr = this.profile.address;
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.trim();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create verification token
userSchema.methods.createVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Static method to find user by email or phone
userSchema.statics.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { phone: identifier }
    ]
  });
};

// Static method to get user statistics
userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        blockedUsers: {
          $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
        },
        totalBalance: { $sum: '$wallet.balance' },
        totalUsdtBalance: { $sum: '$usdtWallet.balance' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    blockedUsers: 0,
    totalBalance: 0,
    totalUsdtBalance: 0
  };
};

module.exports = mongoose.model('User', userSchema);