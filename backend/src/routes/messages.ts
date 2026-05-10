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

router.get('/:leadId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    const messages = await prisma.message.findMany({
      where: { leadId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { leadId, content } = req.body;

    if (!leadId || !content) {
      return res.status(400).json({ error: 'leadId and content required' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        direction: 'OUTGOING',
        status: 'SENT',
        leadId,
        userId,
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { lastMessage: content },
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;