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

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { period } = req.query;

    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const analytics = await prisma.analytics.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: 'asc' },
    });

    const totals = analytics.reduce(
      (acc: any, a: any) => ({
        messages: acc.messages + a.totalMessages,
        aiReplies: acc.aiReplies + a.aiReplies,
        leads: acc.leads + a.leadsGenerated,
        conversations: acc.conversations + a.conversations,
      }),
      { messages: 0, aiReplies: 0, leads: 0, conversations: 0 }
    );

    res.json({ analytics, totals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;