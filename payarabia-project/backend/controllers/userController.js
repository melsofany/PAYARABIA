const User = require('../models/User');
const Transaction = require('../models/Transaction');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Update user profile
// @route   PATCH /api/user/profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['fullName', 'profile'];
  const filteredBody = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
exports.deleteAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.wallet.balance > 0) {
    return next(new AppError('لا يمكن حذف الحساب مع وجود رصيد. يرجى سحب جميع الأموال أولاً.', 400));
  }

  await User.findByIdAndUpdate(req.user.id, { 
    status: 'deleted',
    email: `deleted_${Date.now()}_${user.email}`,
    phone: `deleted_${Date.now()}_${user.phone}`,
  });

  res.status(204).json({
    status: 'success',
    message: 'تم حذف الحساب بنجاح',
  });
});

// @desc    Upload user avatar
// @route   POST /api/user/upload-avatar
// @access  Private
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('يرجى اختيار صورة', 400));
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'avatars',
      transformation: {
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
      },
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'profile.avatar': result.secure_url },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        avatar: result.secure_url,
        user,
      },
    });
  } catch (error) {
    return next(new AppError('فشل في رفع الصورة', 500));
  }
});

// @desc    Get user wallet
// @route   GET /api/user/wallet
// @access  Private
exports.getWallet = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('wallet usdtWallet');

  res.status(200).json({
    status: 'success',
    data: {
      wallet: user.wallet,
      usdtWallet: user.usdtWallet,
    },
  });
});

// @desc    Get user transactions
// @route   GET /api/user/transactions
// @access  Private
exports.getTransactions = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const transactions = await Transaction.find(filter)
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