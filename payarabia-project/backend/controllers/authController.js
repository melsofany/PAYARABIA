const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Remove password from output
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { fullName, email, phone, password, dateOfBirth } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    return next(new AppError('المستخدم موجود بالفعل بهذا البريد الإلكتروني أو رقم الهاتف', 400));
  }

  // Create new user
  const newUser = await User.create({
    fullName,
    email,
    phone,
    password,
    dateOfBirth,
  });

  // Generate verification token
  const verificationToken = newUser.createVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Send verification email
  const verificationURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
  
  try {
    await sendEmail({
      email: newUser.email,
      subject: 'تفعيل حسابك في PAYARABIA',
      message: `
        مرحباً ${newUser.fullName}،
        
        شكراً لك على التسجيل في PAYARABIA. يرجى النقر على الرابط التالي لتفعيل حسابك:
        
        ${verificationURL}
        
        هذا الرابط صالح لمدة 24 ساعة.
        
        إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد الإلكتروني.
        
        مع تحيات فريق PAYARABIA
      `,
    });

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    newUser.verificationToken = undefined;
    newUser.verificationTokenExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(new AppError('حدث خطأ في إرسال بريد التفعيل. حاول مرة أخرى.', 500));
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('يرجى إدخال البريد الإلكتروني وكلمة المرور', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
  }

  // 3) Check if user is active
  if (user.status === 'blocked') {
    return next(new AppError('تم حظر حسابك. يرجى التواصل مع الدعم الفني.', 403));
  }

  // 4) Check if account is locked
  if (user.isLocked) {
    return next(new AppError('تم قفل حسابك مؤقتاً بسبب محاولات تسجيل دخول خاطئة متعددة. حاول مرة أخرى لاحقاً.', 423));
  }

  // 5) Update login attempts and last login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();

  // 6) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم تسجيل الخروج بنجاح',
  });
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('رمز التفعيل غير صحيح أو منتهي الصلاحية', 400));
  }

  // 3) Update user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.status = 'active';
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'تم تفعيل الحساب بنجاح',
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.isVerified) {
    return next(new AppError('الحساب مفعل بالفعل', 400));
  }

  // Generate new verification token
  const verificationToken = user.createVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
  
  await sendEmail({
    email: user.email,
    subject: 'تفعيل حسابك في PAYARABIA',
    message: `
      مرحباً ${user.fullName}،
      
      يرجى النقر على الرابط التالي لتفعيل حسابك:
      
      ${verificationURL}
      
      هذا الرابط صالح لمدة 24 ساعة.
      
      مع تحيات فريق PAYARABIA
    `,
  });

  res.status(200).json({
    status: 'success',
    message: 'تم إرسال بريد التفعيل مرة أخرى',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('لا يوجد مستخدم بهذا البريد الإلكتروني', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'إعادة تعيين كلمة المرور - PAYARABIA',
      message: `
        مرحباً ${user.fullName}،
        
        تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. يرجى النقر على الرابط التالي:
        
        ${resetURL}
        
        هذا الرابط صالح لمدة 10 دقائق فقط.
        
        إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
        
        مع تحيات فريق PAYARABIA
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('حدث خطأ في إرسال البريد الإلكتروني. حاول مرة أخرى.', 500));
  }
});

// @desc    Reset password
// @route   PATCH /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('رمز إعادة التعيين غير صحيح أو منتهي الصلاحية', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

// @desc    Update password
// @route   PATCH /api/auth/update-password
// @access  Private
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('كلمة المرور الحالية غير صحيحة', 401));
  }

  // 3) If so, update password
  user.password = req.body.newPassword;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Protect routes
// @route   All protected routes
// @access  Private
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('لم تقم بتسجيل الدخول! يرجى تسجيل الدخول للوصول.', 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('المستخدم الذي ينتمي إلى هذا الرمز لم يعد موجوداً.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('قام المستخدم بتغيير كلمة المرور مؤخراً! يرجى تسجيل الدخول مرة أخرى.', 401));
  }

  // 5) Check if user is active
  if (currentUser.status === 'blocked') {
    return next(new AppError('تم حظر حسابك. يرجى التواصل مع الدعم الفني.', 403));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// @desc    Restrict to certain roles
// @route   All admin routes
// @access  Private/Admin
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('ليس لديك صلاحية للوصول إلى هذا الإجراء', 403));
    }
    next();
  };
};