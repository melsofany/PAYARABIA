const Ticket = require('../models/Ticket');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { generateAgoraToken } = require('../utils/agora');

// @desc    Create support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createTicket = catchAsync(async (req, res, next) => {
  const { subject, message, category, priority, subcategory } = req.body;

  // Validate input
  if (!subject || !message || !category) {
    return next(new AppError('يرجى إدخال جميع البيانات المطلوبة', 400));
  }

  // Create ticket
  const ticket = await Ticket.create({
    user: req.user.id,
    subject,
    message,
    category,
    priority: priority || 'medium',
    subcategory,
    messages: [{
      message,
      senderType: 'user',
      sender: req.user.id,
      senderName: req.user.fullName,
    }],
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      source: 'mobile',
    },
  });

  // Populate user data
  await ticket.populate('user', 'fullName email phone');

  res.status(201).json({
    status: 'success',
    message: 'تم إنشاء التذكرة بنجاح',
    data: {
      ticket,
    },
  });
});

// @desc    Get user tickets
// @route   GET /api/support/tickets
// @access  Private
exports.getTickets = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }
  
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const tickets = await Ticket.find(filter)
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

// @desc    Get ticket details
// @route   GET /api/support/tickets/:id
// @access  Private
exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    user: req.user.id,
  })
    .populate('user', 'fullName email phone')
    .populate('assignedTo', 'fullName email')
    .populate('resolvedBy', 'fullName email');

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة أو لا تملك صلاحية الوصول إليها', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

// @desc    Add message to ticket
// @route   POST /api/support/tickets/:id/messages
// @access  Private
exports.addMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return next(new AppError('يرجى إدخال الرسالة', 400));
  }

  const ticket = await Ticket.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة أو لا تملك صلاحية الوصول إليها', 404));
  }

  if (ticket.status === 'closed') {
    return next(new AppError('لا يمكن إضافة رسائل لتذكرة مغلقة', 400));
  }

  const newMessage = {
    message,
    senderType: 'user',
    sender: req.user.id,
    senderName: req.user.fullName,
  };

  ticket.messages.push(newMessage);
  ticket.status = 'open'; // Reopen ticket if it was resolved
  await ticket.save();

  res.status(201).json({
    status: 'success',
    message: 'تم إضافة الرسالة بنجاح',
    data: {
      message: newMessage,
    },
  });
});

// @desc    Initiate voice call
// @route   POST /api/support/voice-call/initiate
// @access  Private
exports.initiateVoiceCall = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;

  if (!ticketId) {
    return next(new AppError('يرجى إدخال معرف التذكرة', 400));
  }

  // Check if ticket exists and belongs to user
  const ticket = await Ticket.findOne({
    _id: ticketId,
    user: req.user.id,
  });

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة أو لا تملك صلاحية الوصول إليها', 404));
  }

  // Check if there's already an active call
  if (ticket.voiceCall && ticket.voiceCall.status === 'connected') {
    return next(new AppError('يوجد مكالمة نشطة بالفعل', 400));
  }

  // Generate Agora token and channel name
  const channelName = `ticket_${ticketId}_${Date.now()}`;
  const uid = Math.floor(Math.random() * 1000000);
  
  const token = generateAgoraToken({
    channelName,
    uid,
    role: 'publisher',
    expirationTimeInSeconds: 3600, // 1 hour
  });

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
    message: 'تم بدء المكالمة بنجاح',
    data: {
      call: {
        callId: ticket.voiceCall.callId,
        channelName,
        token,
        uid,
        status: 'initiated',
      },
    },
  });
});

// @desc    End voice call
// @route   POST /api/support/voice-call/:callId/end
// @access  Private
exports.endVoiceCall = catchAsync(async (req, res, next) => {
  const { callId } = req.params;

  const ticket = await Ticket.findOne({
    'voiceCall.callId': callId,
    user: req.user.id,
  });

  if (!ticket) {
    return next(new AppError('المكالمة غير موجودة أو لا تملك صلاحية الوصول إليها', 404));
  }

  if (ticket.voiceCall.status === 'ended') {
    return next(new AppError('المكالمة منتهية بالفعل', 400));
  }

  // Update call status
  ticket.voiceCall.status = 'ended';
  ticket.voiceCall.endedAt = new Date();
  
  if (ticket.voiceCall.startedAt) {
    ticket.voiceCall.duration = Math.floor(
      (ticket.voiceCall.endedAt - ticket.voiceCall.startedAt) / 1000
    );
  }

  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'تم إنهاء المكالمة بنجاح',
    data: {
      call: {
        callId: ticket.voiceCall.callId,
        duration: ticket.voiceCall.duration,
        status: 'ended',
      },
    },
  });
});

// @desc    Rate ticket satisfaction
// @route   POST /api/support/tickets/:id/rate
// @access  Private
exports.rateTicket = catchAsync(async (req, res, next) => {
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('يرجى إدخال تقييم صحيح من 1 إلى 5', 400));
  }

  const ticket = await Ticket.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!ticket) {
    return next(new AppError('التذكرة غير موجودة أو لا تملك صلاحية الوصول إليها', 404));
  }

  if (ticket.status !== 'resolved') {
    return next(new AppError('لا يمكن تقييم تذكرة غير محلولة', 400));
  }

  if (ticket.satisfaction.rating) {
    return next(new AppError('تم تقييم هذه التذكرة مسبقاً', 400));
  }

  ticket.satisfaction = {
    rating,
    feedback,
    ratedAt: new Date(),
  };

  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تقييم التذكرة بنجاح',
    data: {
      satisfaction: ticket.satisfaction,
    },
  });
});

// @desc    Get ticket categories
// @route   GET /api/support/categories
// @access  Private
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = [
    {
      id: 'technical',
      name: 'تقني',
      description: 'مشاكل تقنية في التطبيق أو الموقع',
      subcategories: [
        { id: 'login_issues', name: 'مشاكل تسجيل الدخول' },
        { id: 'app_bugs', name: 'أخطاء في التطبيق' },
        { id: 'feature_request', name: 'طلب ميزة جديدة' },
      ],
    },
    {
      id: 'financial',
      name: 'مالي',
      description: 'مشاكل متعلقة بالمعاملات المالية',
      subcategories: [
        { id: 'transaction_problems', name: 'مشاكل في المعاملات' },
        { id: 'payment_issues', name: 'مشاكل في الدفع' },
        { id: 'refund_request', name: 'طلب استرداد' },
      ],
    },
    {
      id: 'account',
      name: 'حساب',
      description: 'مشاكل متعلقة بالحساب الشخصي',
      subcategories: [
        { id: 'account_verification', name: 'توثيق الحساب' },
        { id: 'password_reset', name: 'إعادة تعيين كلمة المرور' },
        { id: 'profile_update', name: 'تحديث الملف الشخصي' },
      ],
    },
    {
      id: 'general',
      name: 'عام',
      description: 'استفسارات عامة',
      subcategories: [
        { id: 'information', name: 'طلب معلومات' },
        { id: 'other', name: 'أخرى' },
      ],
    },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      categories,
    },
  });
});

// @desc    Get ticket priorities
// @route   GET /api/support/priorities
// @access  Private
exports.getPriorities = catchAsync(async (req, res, next) => {
  const priorities = [
    {
      id: 'low',
      name: 'منخفضة',
      description: 'مشكلة بسيطة لا تؤثر على الاستخدام',
      color: '#4CAF50',
    },
    {
      id: 'medium',
      name: 'متوسطة',
      description: 'مشكلة متوسطة تؤثر على بعض الوظائف',
      color: '#FF9800',
    },
    {
      id: 'high',
      name: 'عالية',
      description: 'مشكلة مهمة تؤثر على الاستخدام',
      color: '#F44336',
    },
    {
      id: 'urgent',
      name: 'عاجلة',
      description: 'مشكلة حرجة تحتاج حل فوري',
      color: '#9C27B0',
    },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      priorities,
    },
  });
});