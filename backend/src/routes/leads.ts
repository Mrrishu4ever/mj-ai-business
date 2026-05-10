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
    const { search, status, tag } = req.query;

    const where: any = { userId };
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { phone: { contains: search as string } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { name, phone, email, tags } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone required' });
    }

    const existing = await prisma.lead.findUnique({ where: { phone } });

    if (existing) {
      const lead = await prisma.lead.update({
        where: { phone },
        data: { name, email, tags },
      });
      return res.json(lead);
    }

    const lead = await prisma.lead.create({
      data: { name, phone, email, tags, userId },
    });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, email, tags, status } = req.body;

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { name, email, tags, status },
    });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

router.get('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;

    const leads = await prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const csv = [
      ['Name', 'Phone', 'Email', 'Status', 'Tags', 'Created At'].join(','),
      ...leads.map(l => [
        l.name || '',
        l.phone,
        l.email || '',
        l.status,
        Array.isArray(l.tags) ? l.tags.join(';') : (l.tags || ''),
        l.createdAt.toISOString(),
      ].join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export leads' });
  }
});

export default router;