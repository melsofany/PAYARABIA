const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (amount, currency = 'sar', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm payment intent
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

// Create customer
const createCustomer = async (email, name, phone) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
    });

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Create setup intent for saving payment methods
const createSetupIntent = async (customerId) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return setupIntent;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

// List customer payment methods
const listPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods;
  } catch (error) {
    console.error('Error listing payment methods:', error);
    throw error;
  }
};

// Create refund
const createRefund = async (paymentIntentId, amount, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
      reason,
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

// Get payment intent
const getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error getting payment intent:', error);
    throw error;
  }
};

// Webhook signature verification
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  createCustomer,
  createSetupIntent,
  listPaymentMethods,
  createRefund,
  getPaymentIntent,
  verifyWebhookSignature,
};