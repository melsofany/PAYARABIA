const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'الاسم الكامل مطلوب'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin', 'support'],
    default: 'admin',
  },
  permissions: [{
    type: String,
    enum: [
      'users_management',
      'transactions_management',
      'support_management',
      'finance_management',
      'settings_management',
      'reports_access'
    ],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  profile: {
    avatar: String,
    phone: String,
    department: String,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
adminSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('Admin', adminSchema);