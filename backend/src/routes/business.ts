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
    const business = await prisma.business.findUnique({
      where: { userId },
      include: { settings: true },
    });
    res.json(business || { name: "My Business", isConnected: false, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { name, description, phone, address, logo } = req.body;

    const existing = await prisma.business.findUnique({ where: { userId } });

    if (existing) {
      const business = await prisma.business.update({
        where: { userId },
        data: { name, description, phone, address, logo },
      });
      return res.json(business);
    }

    const business = await prisma.business.create({
      data: { name: name || 'My Business', description, phone, address, logo, userId },
    });
    res.json(business);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save business' });
  }
});

router.post('/connect-whatsapp', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { phoneNumber, token } = req.body;

    if (!phoneNumber || !token) {
      return res.status(400).json({ error: 'Phone number and token required' });
    }

    // Check if business exists, create if not
    let business = await prisma.business.findUnique({ where: { userId } });

    if (!business) {
      business = await prisma.business.create({
        data: { name: 'My Business', userId },
      });
    }

    // Update with WhatsApp credentials
    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        whatsappNumber: phoneNumber,
        whatsappToken: token,
        isConnected: true
      },
    });

    res.json({
      ...updated,
      message: 'WhatsApp connected successfully'
    });
  } catch (error) {
    console.error('WhatsApp connect error:', error);
    res.status(500).json({ error: 'Failed to connect WhatsApp' });
  }
});

router.post('/disconnect-whatsapp', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await prisma.business.update({
      where: { id: business.id },
      data: { isConnected: false },
    });

    res.json({ message: 'WhatsApp disconnected', isConnected: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
});

export default router;