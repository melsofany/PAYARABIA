const User = require('../models/User');
const Admin = require('../models/Admin');
const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');
const ExchangeRate = require('../models/ExchangeRate');
const Commission = require('../models/Commission');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('يرجى إدخال البريد الإلكتروني وكلمة المرور', 400));
  }

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
  }

  if (!admin.isActive) {
    return next(new AppError('تم إلغاء تفعيل حسابك', 403));
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = signToken(admin._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    },
  });
});

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Private
exports.adminLogout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'تم تسجيل الخروج بنجاح',
  });
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
exports.getAdminProfile = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      admin,
    },
  });
});

// @desc    Update admin profile
// @route   PATCH /api/admin/profile
// @access  Private
exports.updateAdminProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['fullName', 'profile'];
  const filteredBody = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const admin = await Admin.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      admin,
    },
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const userStats = await User.getStats();
  const transactionStats = await Transaction.getStats();
  const ticketStats = await Ticket.getStats();

  res.status(200).json({
    status: 'success',
    data: {
      users: userStats,
      transactions: transactionStats,
      tickets: ticketStats,
    },
  });
});

// @desc    Get recent transactions
// @route   GET /api/admin/transactions/recent
// @access  Private
exports.getRecentTransactions = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const transactions = await Transaction.getRecent(limit);

  res.status(200).json({
    status: 'success',
    data: {
      transactions,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private
exports.getUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.verification) {
    filter.isVerified = req.query.verification === 'verified';
  }
  
  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Update user
// @route   PATCH /api/admin/users/:id
// @access  Private
exports.updateUser = catchAsync(async (req, res, next) => {
  const allowedFields = ['fullName', 'email', 'phone', 'status', 'isVerified'];
  const filteredBody = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Block user
// @route   POST /api/admin/users/:id/block
// @access  Private
exports.blockUser = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      status: 'blocked',
      blockedReason: reason,
      blockedAt: new Date(),
    },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'تم حظر المستخدم بنجاح',
    data: {
      user,
    },
  });
});

// @desc    Unblock user
// @route   POST /api/admin/users/:id/unblock
// @access  Private
exports.unblockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      status: 'active',
      blockedReason: undefined,
      blockedAt: undefined,
    },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'تم إلغاء حظر المستخدم بنجاح',
    data: {
      user,
    },
  });
});

// @desc    Get all tickets
// @route   GET /api/admin/support/tickets
// @access  Private
exports.getTickets = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }
  
  if (req.query.search) {
    filter.$or = [
      { subject: { $regex: req.query.search, $options: 'i' } },
      { ticketNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const tickets = await Ticket.find(filter)
    .populate('user', 'fullName email phone')
    .populate('assignedTo', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Ticket.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      tickets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
});

// @desc    Get ticket by ID
// @route   GET /api/admin/support/tickets/:id
// @access  Private
exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('user', 'fullName email phone')
    .populate('assignedTo', 'fullName email')
    .populate('resolvedBy', 'fullName email');

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// @desc    Update ticket status
// @route   PATCH /api/admin/support/tickets/:id
// @access  Private
exports.updateTicketStatus = catchAsync(async (req, res, next) => {
  const { status, priority } = req.body;

  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status, priority },
    { new: true }
  )
    .populate('user', 'fullName email phone')
    .populate('assignedTo', 'fullName email');

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// @desc    Add message to ticket
// @route   POST /api/admin/support/tickets/:id/messages
// @access  Private
exports.addTicketMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة', 404));
  }

  const newMessage = {
    message,
    senderType: 'admin',
    sender: req.user.id,
    senderName: req.user.fullName,
  };

  ticket.messages.push(newMessage);
  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: newMessage,
    },
  });
});

// @desc    Assign ticket
// @route   POST /api/admin/support/tickets/:id/assign
// @access  Private
exports.assignTicket = catchAsync(async (req, res, next) => {
  const { adminId } = req.body;

  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: adminId,
      assignedAt: new Date(),
      status: 'in_progress',
    },
    { new: true }
  )
    .populate('user', 'fullName email phone')
    .populate('assignedTo', 'fullName email');

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'تم تعيين التذكرة بنجاح',
    data: {
      ticket,
    },
  });
});

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private
exports.getTransactions = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.search) {
    filter.$or = [
      { transactionNumber: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const transactions = await Transaction.find(filter)
    .populate('user', 'fullName email phone')
    .populate('recipient', 'fullName email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
});

// @desc    Get transaction by ID
// @route   GET /api/admin/transactions/:id
// @access  Private
exports.getTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('user', 'fullName email phone')
    .populate('recipient', 'fullName email phone');

  if (!transaction) {
    return next(new AppError('المعاملة غير موجودة', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transaction,
    },
  });
});

// @desc    Update transaction status
// @route   PATCH /api/admin/transactions/:id
// @access  Private
exports.updateTransactionStatus = catchAsync(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminNotes,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    },
    { new: true }
  )
    .populate('user', 'fullName email phone')
    .populate('recipient', 'fullName email phone');

  if (!transaction) {
    return next(new AppError('المعاملة غير موجودة', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transaction,
    },
  });
});

// @desc    Get exchange rates
// @route   GET /api/admin/finance/exchange-rates
// @access  Private
exports.getExchangeRates = catchAsync(async (req, res, next) => {
  const exchangeRates = await ExchangeRate.find({ isActive: true }).sort({
    fromCurrency: 1,
    toCurrency: 1,
  });

  res.status(200).json({
    status: 'success',
    data: {
      exchangeRates,
    },
  });
});

// @desc    Update exchange rate
// @route   PUT /api/admin/finance/exchange-rates
// @access  Private
exports.updateExchangeRate = catchAsync(async (req, res, next) => {
  const { fromCurrency, toCurrency, rate } = req.body;

  const exchangeRate = await ExchangeRate.findOneAndUpdate(
    { fromCurrency, toCurrency },
    { rate, lastUpdated: new Date(), source: 'manual' },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      exchangeRate,
    },
  });
});

// @desc    Get commission settings
// @route   GET /api/admin/finance/commission
// @access  Private
exports.getCommissionSettings = catchAsync(async (req, res, next) => {
  const commissions = await Commission.find({ isActive: true }).sort({ type: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      commissions,
    },
  });
});

// @desc    Update commission settings
// @route   PUT /api/admin/finance/commission
// @access  Private
exports.updateCommissionSettings = catchAsync(async (req, res, next) => {
  const { commissions } = req.body;

  for (const commissionData of commissions) {
    await Commission.findOneAndUpdate(
      { type: commissionData.type },
      commissionData,
      { new: true, upsert: true }
    );
  }

  const updatedCommissions = await Commission.find({ isActive: true }).sort({ type: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      commissions: updatedCommissions,
    },
  });
});

// @desc    Initiate voice call
// @route   POST /api/admin/support/voice-call/initiate
// @access  Private
exports.initiateVoiceCall = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة', 404));
  }

  // Generate Agora token and channel name
  const channelName = `ticket_${ticketId}_${Date.now()}`;
  const token = 'agora_token_here'; // This should be generated using Agora SDK

  // Update ticket with voice call info
  ticket.voiceCall = {
    callId: `call_${Date.now()}`,
    channelName,
    token,
    status: 'initiated',
  };

  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      call: {
        callId: ticket.voiceCall.callId,
        channelName,
        token,
        status: 'initiated',
      },
    },
  });
});

// @desc    End voice call
// @route   POST /api/admin/support/voice-call/:callId/end
// @access  Private
exports.endVoiceCall = catchAsync(async (req, res, next) => {
  const { callId } = req.params;

  const ticket = await Ticket.findOne({ 'voiceCall.callId': callId });

  if (!ticket) {
    return next(new AppError('المكالمة غير موجودة', 404));
  }

  ticket.voiceCall.status = 'ended';
  ticket.voiceCall.endedAt = new Date();
  ticket.voiceCall.duration = Math.floor(
    (ticket.voiceCall.endedAt - ticket.voiceCall.startedAt) / 1000
  );

  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'تم إنهاء المكالمة بنجاح',
  });
});

// @desc    Generate report
// @route   POST /api/admin/reports/generate
// @access  Private
exports.generateReport = catchAsync(async (req, res, next) => {
  const { type, dateRange, filters } = req.body;

  let reportData = {};

  switch (type) {
    case 'transactions':
      reportData = await Transaction.getStats(dateRange);
      break;
    case 'users':
      reportData = await User.getStats();
      break;
    case 'tickets':
      reportData = await Ticket.getStats(dateRange);
      break;
    default:
      return next(new AppError('نوع التقرير غير صحيح', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      report: {
        type,
        dateRange,
        data: reportData,
        generatedAt: new Date(),
        generatedBy: req.user.id,
      },
    },
  });
});