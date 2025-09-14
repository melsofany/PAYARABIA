const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (options) => {
  try {
    const message = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.phone,
    });

    console.log('SMS sent successfully:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

const sendVerificationCode = async (phone, code) => {
  const message = `رمز التحقق الخاص بك في PAYARABIA هو: ${code}. هذا الرمز صالح لمدة 10 دقائق.`;
  
  return sendSMS({
    phone,
    message,
  });
};

const sendTransactionNotification = async (phone, transaction) => {
  let message = '';
  
  switch (transaction.type) {
    case 'deposit':
      message = `تم إيداع ${transaction.amount} ${transaction.currency} في محفظتك بنجاح.`;
      break;
    case 'withdrawal':
      message = `تم سحب ${transaction.amount} ${transaction.currency} من محفظتك بنجاح.`;
      break;
    case 'transfer':
      message = `تم تحويل ${transaction.amount} ${transaction.currency} إلى ${transaction.recipientName} بنجاح.`;
      break;
    case 'exchange':
      message = `تم تحويل ${transaction.fromAmount} ${transaction.fromCurrency} إلى ${transaction.toAmount} ${transaction.toCurrency} بنجاح.`;
      break;
    default:
      message = `تمت معاملة مالية بقيمة ${transaction.amount} ${transaction.currency} بنجاح.`;
  }
  
  return sendSMS({
    phone,
    message,
  });
};

module.exports = {
  sendSMS,
  sendVerificationCode,
  sendTransactionNotification,
};