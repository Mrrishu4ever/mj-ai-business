/**
 * MJ AI Stripe Payment Integration
 */

const express = require('express');
const https = require('https');
const crypto = require('crypto');

const app = express();

// Stripe webhook - verify webhook signature
function verifyStripeSignature(payload, signature, webhookSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

// Create Stripe checkout session
app.post('/api/create-checkout-session', express.raw({ type: 'application/json' }), async (req, res) => {
  const { plan, customerId } = req.body;

  const plans = {
    starter: { price: 0, name: 'Starter Plan' },
    pro: { price: 2900, name: 'Pro Plan' }, // $29 in cents
    enterprise: { price: 9900, name: 'Enterprise Plan' }, // $99 in cents
  };

  const selectedPlan = plans[plan];
  if (!selectedPlan) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  // In production, use Stripe SDK:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({...});

  // Demo response
  res.json({
    sessionId: `demo_${Date.now()}`,
    url: `https://checkout.stripe.com/demo/${plan}`,
  });
});

// Stripe webhook handler
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verify signature in production
  // if (!verifyStripeSignature(req.body, signature, webhookSecret)) {
  //   return res.status(400).json({ error: 'Invalid signature' });
  // }

  const event = JSON.parse(req.body);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('💳 Payment completed:', session.id);
      // Update user subscription in database
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      console.log('🔄 Subscription updated:', subscription.id);
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      console.log('❌ Subscription cancelled:', deletedSub.id);
      break;

    case 'invoice.payment_failed':
      const invoice = event.data.object;
      console.log('⚠️ Payment failed:', invoice.id);
      break;
  }

  res.json({ received: true });
});

// Get subscription status
app.get('/api/subscription/:customerId', async (req, res) => {
  const { customerId } = req.params;

  // In production, fetch from database
  res.json({
    customerId,
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
});

// Create customer
app.post('/api/customers', async (req, res) => {
  const { email, name } = req.body;

  // In production, create in Stripe
  const customerId = `cus_${Date.now()}`;

  res.json({
    customerId,
    email,
    name,
  });
});

module.exports = app;