import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const authMiddleware = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    (req as any).userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Plan limits
const PLAN_LIMITS: any = {
  FREE: { messageLimit: 100, aiEnabled: false, maxLeads: 10, maxSeats: 1, price: 0 },
  PRO: { messageLimit: 1000, aiEnabled: true, maxLeads: 100, maxSeats: 3, price: 29 },
  ENTERPRISE: { messageLimit: -1, aiEnabled: true, maxLeads: -1, maxSeats: 10, price: 99 },
};

// Get subscription
async function getSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription) {
    return {
      plan: 'FREE',
      status: 'ACTIVE',
      messageCount: 0,
      messageLimit: 100,
      aiEnabled: false,
      maxLeads: 10,
      maxSeats: 1,
    };
  }

  const limits = PLAN_LIMITS[user.subscription.plan] || PLAN_LIMITS.FREE;
  return {
    plan: user.subscription.plan,
    status: user.subscription.status,
    messageCount: user.subscription.messageCount,
    messageLimit: user.subscription.messageLimit,
    aiEnabled: limits.aiEnabled,
    maxLeads: limits.maxLeads,
    maxSeats: limits.maxSeats,
  };
}

// Upgrade plan
async function upgradePlan(userId: string, newPlan: string) {
  const limits = PLAN_LIMITS[newPlan];
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (user?.subscription) {
    await prisma.subscription.update({
      where: { id: user.subscriptionId! },
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
    return { success: true, plan: newPlan };
  }
  return null;
}

// Get current subscription
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const subscription = await getSubscription(userId);

    const plans = [
      { name: 'FREE', messageLimit: 100, aiEnabled: false, maxLeads: 10, maxSeats: 1, price: 0 },
      { name: 'PRO', messageLimit: 1000, aiEnabled: true, maxLeads: 100, maxSeats: 3, price: 29 },
      { name: 'ENTERPRISE', messageLimit: -1, aiEnabled: true, maxLeads: -1, maxSeats: 10, price: 99 },
    ];

    res.json({ ...subscription, availablePlans: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Upgrade plan
router.post('/upgrade', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { plan } = req.body;

    const validPlans = ['FREE', 'PRO', 'ENTERPRISE'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const result = await upgradePlan(userId, plan);
    res.json({ success: true, message: `Upgraded to ${plan}`, plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upgrade failed' });
  }
});

// Cancel
router.post('/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (user?.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscriptionId! },
        data: { status: 'CANCELLED' },
      });
    }

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Cancel failed' });
  }
});

export default router;