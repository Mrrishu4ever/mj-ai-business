import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    const { messages, phone_number, userId } = req.body;

    for (const msg of messages || []) {
      const phone = msg.from;

      let lead = await prisma.lead.findUnique({ where: { phone } });
      if (!lead && userId) {
        lead = await prisma.lead.create({
          data: { phone, userId },
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;