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
    const { date } = req.query;

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { title, date, duration, notes, leadId } = req.body;

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const appointment = await prisma.appointment.create({
      data: { title, date: new Date(date), duration, notes, leadId, businessId: business.id },
    });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

export default router;