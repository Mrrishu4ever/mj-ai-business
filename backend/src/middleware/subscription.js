/**
 * Subscription Middleware
 * Feature gating and message limit checking
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Plan limits configuration
const PLAN_LIMITS = {
  FREE: {
    messageLimit: 100,
    aiEnabled: false,
    maxLeads: 10,
    maxSeats: 1,
  },
  PRO: {
    messageLimit: 1000,
    aiEnabled: true,
    maxLeads: 100,
    maxSeats: 3,
  },
  ENTERPRISE: {
    messageLimit: -1, // Unlimited
    aiEnabled: true,
    maxLeads: -1, // Unlimited
    maxSeats: 10,
  },
};

/**
 * Check if user can send message
 */
async function checkMessageLimit(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription) {
    return { allowed: true, reason: 'No subscription' };
  }

  const { plan, messageCount, messageLimit, status } = user.subscription;
  const limits = PLAN_LIMITS[plan];

  // Check if subscription is active
  if (status !== 'ACTIVE') {
    return {
      allowed: false,
      reason: `Subscription ${status}. Please renew.`,
      upgradeRequired: true,
    };
  }

  // Check message limit
  if (messageLimit > 0 && messageCount >= messageLimit) {
    return {
      allowed: false,
      reason: `Message limit reached (${messageCount}/${messageLimit}). Upgrade to continue.`,
      upgradeRequired: true,
      currentPlan: plan,
      messageCount,
      messageLimit,
    };
  }

  return {
    allowed: true,
    currentPlan: plan,
    messageCount,
    messageLimit,
    aiEnabled: limits.aiEnabled,
  };
}

/**
 * Increment message count
 */
async function incrementMessageCount(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (user?.subscription) {
    await prisma.subscription.update({
      where: { id: user.subscriptionId },
      data: {
        messageCount: { increment: 1 },
      },
    });
  }
}

/**
 * Get subscription details
 */
async function getSubscription(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription) {
    return {
      plan: 'FREE',
      status: 'ACTIVE',
      messageCount: 0,
      messageLimit: PLAN_LIMITS.FREE.messageLimit,
      aiEnabled: PLAN_LIMITS.FREE.aiEnabled,
      maxLeads: PLAN_LIMITS.FREE.maxLeads,
      maxSeats: PLAN_LIMITS.FREE.maxSeats,
    };
  }

  const sub = user.subscription;
  const limits = PLAN_LIMITS[sub.plan];

  return {
    plan: sub.plan,
    status: sub.status,
    messageCount: sub.messageCount,
    messageLimit: sub.messageLimit,
    aiEnabled: limits.aiEnabled,
    maxLeads: limits.maxLeads,
    maxSeats: limits.maxSeats,
  };
}

/**
 * Upgrade subscription
 */
async function upgradePlan(userId, newPlan) {
  if (!PLAN_LIMITS[newPlan]) {
    throw new Error('Invalid plan');
  }

  const limits = PLAN_LIMITS[newPlan];
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  // Update or create subscription
  if (user?.subscription) {
    await prisma.subscription.update({
      where: { id: user.subscriptionId },
      data: {
        plan: newPlan,
        status: 'ACTIVE',
        messageLimit: limits.messageLimit,
        aiEnabled: limits.aiEnabled,
        maxLeads: limits.maxLeads,
        maxSeats: limits.maxSeats,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        plan: newPlan,
        status: 'ACTIVE',
        messageLimit: limits.messageLimit,
        aiEnabled: limits.aiEnabled,
        maxLeads: limits.maxLeads,
        maxSeats: limits.maxSeats,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        users: { connect: { id: userId } },
      },
    });
  }

  return { success: true, plan: newPlan };
}

/**
 * Reset monthly messages (call via cron job)
 */
async function resetMonthlyMessages() {
  await prisma.subscription.updateMany({
    where: {
      messageCount: { gt: 0 },
    },
    data: {
      messageCount: 0,
    },
  });
}

module.exports = {
  checkMessageLimit,
  incrementMessageCount,
  getSubscription,
  upgradePlan,
  resetMonthlyMessages,
  PLAN_LIMITS,
};