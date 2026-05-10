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

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const settings = await prisma.aISettings.findUnique({
      where: { businessId: business.id },
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const {
      isEnabled,
      tone,
      greetingMessage,
      customInstructions,
      autoReplyDelay,
      businessName,
      pricing,
      services,
      language,
    } = req.body;

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const existing = await prisma.aISettings.findUnique({ where: { businessId: business.id } });

    if (existing) {
      const settings = await prisma.aISettings.update({
        where: { businessId: business.id },
        data: {
          isEnabled,
          tone,
          greetingMessage,
          customInstructions,
          autoReplyDelay,
          businessName,
          pricing,
          services,
          language,
        },
      });
      return res.json(settings);
    }

    const settings = await prisma.aISettings.create({
      data: {
        businessId: business.id,
        isEnabled,
        tone,
        greetingMessage,
        customInstructions,
        autoReplyDelay,
        businessName,
        pricing,
        services,
        language,
      },
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;