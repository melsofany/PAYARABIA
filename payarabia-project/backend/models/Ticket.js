const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'الرسالة مطلوبة'],
    maxlength: [2000, 'الرسالة لا يجب أن تتجاوز 2000 حرف'],
  },
  senderType: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderType === "user" ? "User" : "Admin"',
    required: true,
  },
  senderName: String,
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
  }],
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
}, {
  timestamps: true,
});

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'موضوع التذكرة مطلوب'],
    maxlength: [200, 'الموضوع لا يجب أن يتجاوز 200 حرف'],
  },
  message: {
    type: String,
    required: [true, 'رسالة التذكرة مطلوبة'],
    maxlength: [2000, 'الرسالة لا يجب أن تتجاوز 2000 حرف'],
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['technical', 'financial', 'general', 'account', 'security'],
    required: true,
  },
  subcategory: {
    type: String,
    enum: [
      'login_issues',
      'transaction_problems',
      'account_verification',
      'password_reset',
      'payment_issues',
      'app_bugs',
      'feature_request',
      'other'
    ],
  },
  messages: [ticketMessageSchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  assignedAt: Date,
  // Voice call related
  voiceCall: {
    callId: String,
    channelName: String,
    token: String,
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'connected', 'ended'],
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number, // in seconds
    recordingUrl: String,
  },
  // Resolution
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  resolution: String,
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    ratedAt: Date,
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
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web',
    },
  },
  // Tags for categorization
  tags: [String],
  // Related transactions or issues
  relatedTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
  // SLA tracking
  sla: {
    targetResponseTime: {
      type: Number,
      default: 24, // hours
    },
    targetResolutionTime: {
      type: Number,
      default: 72, // hours
    },
    firstResponseAt: Date,
    escalatedAt: Date,
    escalationReason: String,
  },
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
  followUpNotes: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ 'voiceCall.callId': 1 });

// Virtual for ticket age
ticketSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for response time
ticketSchema.virtual('responseTime').get(function() {
  if (this.sla.firstResponseAt) {
    return this.sla.firstResponseAt - this.createdAt.getTime();
  }
  return null;
});

// Virtual for resolution time
ticketSchema.virtual('resolutionTime').get(function() {
  if (this.resolvedAt) {
    return this.resolvedAt - this.createdAt.getTime();
  }
  return null;
});

// Virtual for is overdue
ticketSchema.virtual('isOverdue').get(function() {
  const now = Date.now();
  const targetResponse = this.createdAt.getTime() + (this.sla.targetResponseTime * 60 * 60 * 1000);
  return now > targetResponse && !this.sla.firstResponseAt;
});

// Pre-save middleware to generate ticket number
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TK-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to update SLA
ticketSchema.pre('save', function(next) {
  // Set first response time if this is the first admin message
  if (this.isModified('messages') && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage.senderType === 'admin' && !this.sla.firstResponseAt) {
      this.sla.firstResponseAt = new Date();
    }
  }
  
  // Set resolved time if status changed to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  next();
});

// Static method to get ticket statistics
ticketSchema.statics.getStats = async function(dateRange = {}) {
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
        totalTickets: { $sum: 1 },
        openTickets: {
          $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
        },
        inProgressTickets: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        resolvedTickets: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        closedTickets: {
          $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
        },
        urgentTickets: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        highPriorityTickets: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        averageResponseTime: {
          $avg: {
            $cond: [
              { $ne: ['$sla.firstResponseAt', null] },
              { $subtract: ['$sla.firstResponseAt', '$createdAt'] },
              null
            ]
          }
        },
        averageResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$resolvedAt', null] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    urgentTickets: 0,
    highPriorityTickets: 0,
    averageResponseTime: 0,
    averageResolutionTime: 0
  };
};

// Static method to get tickets by status
ticketSchema.statics.getByStatus = function(status, limit = 10) {
  return this.find({ status })
    .populate('user', 'fullName email phone')
    .populate('assignedTo', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get user tickets
ticketSchema.statics.getUserTickets = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .populate('assignedTo', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get overdue tickets
ticketSchema.statics.getOverdueTickets = function() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return this.find({
    status: { $in: ['open', 'in_progress'] },
    createdAt: { $lt: oneDayAgo },
    'sla.firstResponseAt': { $exists: false }
  })
    .populate('user', 'fullName email phone')
    .populate('assignedTo', 'fullName email')
    .sort({ createdAt: 1 });
};

// Instance method to add message
ticketSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  return this.save();
};

// Instance method to assign ticket
ticketSchema.methods.assignTo = function(adminId) {
  this.assignedTo = adminId;
  this.assignedAt = new Date();
  this.status = 'in_progress';
  return this.save();
};

// Instance method to resolve ticket
ticketSchema.methods.resolve = function(adminId, resolution) {
  this.status = 'resolved';
  this.resolvedBy = adminId;
  this.resolvedAt = new Date();
  this.resolution = resolution;
  return this.save();
};

// Instance method to escalate ticket
ticketSchema.methods.escalate = function(reason) {
  this.sla.escalatedAt = new Date();
  this.sla.escalationReason = reason;
  this.priority = 'urgent';
  return this.save();
};

module.exports = mongoose.model('Ticket', ticketSchema);