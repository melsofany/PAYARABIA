const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ExchangeRate = require('../models/ExchangeRate');
const Commission = require('../models/Commission');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private
exports.getBalance = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('wallet usdtWallet');

  res.status(200).json({
    status: 'success',
    data: {
      sarBalance: user.wallet.balance,
      usdtBalance: user.usdtWallet.balance,
      usdtAddress: user.usdtWallet.address,
      currency: user.wallet.currency,
    },
  });
});

// @desc    Get user transactions
// @route   GET /api/wallet/transactions
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

// @desc    Transfer money to another user
// @route   POST /api/wallet/transfer
// @access  Private
exports.transferMoney = catchAsync(async (req, res, next) => {
  const { recipientId, amount, currency, description } = req.body;

  // Validate input
  if (!recipientId || !amount || !currency) {
    return next(new AppError('يرجى إدخال جميع البيانات المطلوبة', 400));
  }

  if (amount <= 0) {
    return next(new AppError('المبلغ يجب أن يكون أكبر من صفر', 400));
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(new AppError('المستقبل غير موجود', 404));
  }

  if (recipient.status === 'blocked') {
    return next(new AppError('لا يمكن التحويل إلى مستخدم محظور', 400));
  }

  // Get sender
  const sender = await User.findById(req.user.id);
  if (sender.wallet.balance < amount) {
    return next(new AppError('الرصيد غير كافي', 400));
  }

  // Calculate commission
  const commission = await Commission.findOne({ 
    type: 'local_transfer',
    isActive: true 
  });

  let commissionAmount = 0;
  if (commission) {
    if (commission.rateType === 'percentage') {
      commissionAmount = (amount * commission.rate) / 100;
    } else {
      commissionAmount = commission.rate;
    }
  }

  const totalAmount = amount + commissionAmount;

  if (sender.wallet.balance < totalAmount) {
    return next(new AppError('الرصيد غير كافي لتغطية المبلغ والعمولة', 400));
  }

  // Start transaction
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Update sender balance
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { 'wallet.balance': -totalAmount } },
      { session }
    );

    // Update recipient balance
    await User.findByIdAndUpdate(
      recipientId,
      { $inc: { 'wallet.balance': amount } },
      { session }
    );

    // Create transaction record
    const transaction = await Transaction.create([{
      user: req.user.id,
      type: 'transfer',
      amount: amount,
      currency: currency,
      status: 'completed',
      description: description,
      recipient: recipientId,
      recipientName: recipient.fullName,
      recipientPhone: recipient.phone,
      recipientEmail: recipient.email,
      fees: {
        platform: commissionAmount,
        total: commissionAmount,
      },
      completedAt: new Date(),
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      message: 'تم التحويل بنجاح',
      data: {
        transaction: transaction[0],
        commission: commissionAmount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Get exchange rates
// @route   GET /api/wallet/exchange-rates
// @access  Private
exports.getExchangeRates = catchAsync(async (req, res, next) => {
  const exchangeRates = await ExchangeRate.find({ isActive: true }).sort({
    fromCurrency: 1,
    toCurrency: 1,
  });

  res.status(200).json({
    status: 'success',
    data: {
      rates: exchangeRates,
    },
  });
});

// @desc    Exchange currency
// @route   POST /api/wallet/exchange
// @access  Private
exports.exchangeCurrency = catchAsync(async (req, res, next) => {
  const { fromCurrency, toCurrency, amount } = req.body;

  // Validate input
  if (!fromCurrency || !toCurrency || !amount) {
    return next(new AppError('يرجى إدخال جميع البيانات المطلوبة', 400));
  }

  if (amount <= 0) {
    return next(new AppError('المبلغ يجب أن يكون أكبر من صفر', 400));
  }

  if (fromCurrency === toCurrency) {
    return next(new AppError('لا يمكن تحويل العملة إلى نفسها', 400));
  }

  // Get exchange rate
  const exchangeRate = await ExchangeRate.findOne({
    fromCurrency,
    toCurrency,
    isActive: true,
  });

  if (!exchangeRate) {
    return next(new AppError('سعر الصرف غير متوفر', 400));
  }

  // Get user
  const user = await User.findById(req.user.id);

  // Check balance based on currency
  let userBalance;
  if (fromCurrency === 'USDT') {
    userBalance = user.usdtWallet.balance;
  } else {
    userBalance = user.wallet.balance;
  }

  if (userBalance < amount) {
    return next(new AppError('الرصيد غير كافي', 400));
  }

  // Calculate exchange amount
  const toAmount = amount * exchangeRate.rate;

  // Calculate commission
  const commission = await Commission.findOne({ 
    type: 'currency_exchange',
    isActive: true 
  });

  let commissionAmount = 0;
  if (commission) {
    if (commission.rateType === 'percentage') {
      commissionAmount = (toAmount * commission.rate) / 100;
    } else {
      commissionAmount = commission.rate;
    }
  }

  const finalAmount = toAmount - commissionAmount;

  // Start transaction
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Update balances
    if (fromCurrency === 'USDT') {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'usdtWallet.balance': -amount } },
        { session }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'wallet.balance': -amount } },
        { session }
      );
    }

    if (toCurrency === 'USDT') {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'usdtWallet.balance': finalAmount } },
        { session }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'wallet.balance': finalAmount } },
        { session }
      );
    }

    // Create transaction record
    const transaction = await Transaction.create([{
      user: req.user.id,
      type: 'exchange',
      amount: finalAmount,
      currency: toCurrency,
      status: 'completed',
      description: `تحويل ${amount} ${fromCurrency} إلى ${toCurrency}`,
      exchangeRate: exchangeRate.rate,
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: finalAmount,
      fees: {
        platform: commissionAmount,
        total: commissionAmount,
      },
      completedAt: new Date(),
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      message: 'تم تحويل العملة بنجاح',
      data: {
        transaction: transaction[0],
        exchangeRate: exchangeRate.rate,
        commission: commissionAmount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Deposit money
// @route   POST /api/wallet/deposit
// @access  Private
exports.depositMoney = catchAsync(async (req, res, next) => {
  const { amount, currency, paymentMethod, paymentReference } = req.body;

  // Validate input
  if (!amount || !currency || !paymentMethod) {
    return next(new AppError('يرجى إدخال جميع البيانات المطلوبة', 400));
  }

  if (amount <= 0) {
    return next(new AppError('المبلغ يجب أن يكون أكبر من صفر', 400));
  }

  // Calculate commission
  const commission = await Commission.findOne({ 
    type: 'deposit',
    isActive: true 
  });

  let commissionAmount = 0;
  if (commission) {
    if (commission.rateType === 'percentage') {
      commissionAmount = (amount * commission.rate) / 100;
    } else {
      commissionAmount = commission.rate;
    }
  }

  const finalAmount = amount - commissionAmount;

  // Start transaction
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Update user balance
    if (currency === 'USDT') {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'usdtWallet.balance': finalAmount } },
        { session }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'wallet.balance': finalAmount } },
        { session }
      );
    }

    // Create transaction record
    const transaction = await Transaction.create([{
      user: req.user.id,
      type: 'deposit',
      amount: finalAmount,
      currency: currency,
      status: 'completed',
      description: `إيداع ${amount} ${currency}`,
      paymentMethod,
      paymentReference,
      fees: {
        platform: commissionAmount,
        total: commissionAmount,
      },
      completedAt: new Date(),
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      message: 'تم الإيداع بنجاح',
      data: {
        transaction: transaction[0],
        commission: commissionAmount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Withdraw money
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdrawMoney = catchAsync(async (req, res, next) => {
  const { amount, currency, paymentMethod, paymentReference } = req.body;

  // Validate input
  if (!amount || !currency || !paymentMethod) {
    return next(new AppError('يرجى إدخال جميع البيانات المطلوبة', 400));
  }

  if (amount <= 0) {
    return next(new AppError('المبلغ يجب أن يكون أكبر من صفر', 400));
  }

  // Get user
  const user = await User.findById(req.user.id);

  // Check balance based on currency
  let userBalance;
  if (currency === 'USDT') {
    userBalance = user.usdtWallet.balance;
  } else {
    userBalance = user.wallet.balance;
  }

  if (userBalance < amount) {
    return next(new AppError('الرصيد غير كافي', 400));
  }

  // Calculate commission
  const commission = await Commission.findOne({ 
    type: 'withdrawal',
    isActive: true 
  });

  let commissionAmount = 0;
  if (commission) {
    if (commission.rateType === 'percentage') {
      commissionAmount = (amount * commission.rate) / 100;
    } else {
      commissionAmount = commission.rate;
    }
  }

  const totalAmount = amount + commissionAmount;

  if (userBalance < totalAmount) {
    return next(new AppError('الرصيد غير كافي لتغطية المبلغ والعمولة', 400));
  }

  // Start transaction
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Update user balance
    if (currency === 'USDT') {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'usdtWallet.balance': -totalAmount } },
        { session }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { 'wallet.balance': -totalAmount } },
        { session }
      );
    }

    // Create transaction record
    const transaction = await Transaction.create([{
      user: req.user.id,
      type: 'withdrawal',
      amount: amount,
      currency: currency,
      status: 'completed',
      description: `سحب ${amount} ${currency}`,
      paymentMethod,
      paymentReference,
      fees: {
        platform: commissionAmount,
        total: commissionAmount,
      },
      completedAt: new Date(),
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      message: 'تم السحب بنجاح',
      data: {
        transaction: transaction[0],
        commission: commissionAmount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});