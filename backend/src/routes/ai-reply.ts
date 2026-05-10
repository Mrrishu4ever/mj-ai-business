import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';

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

// AI Response Generator
const generateAIResponse = async (userMessage: string, settings: any, business: any) => {
  const { greetingMessage, customInstructions, tone, businessName, pricing, services, language } = settings || {};

  // Build context
  let systemPrompt = `You are an AI assistant for ${businessName || 'a business'}. `;

  if (tone) {
    systemPrompt += `Always respond in a ${tone} tone. `;
  }
  if (customInstructions) {
    systemPrompt += `${customInstructions} `;
  }
  if (pricing) {
    systemPrompt += `Our pricing: ${pricing}. `;
  }
  if (services) {
    systemPrompt += `Our services: ${services}. `;
  }

  systemPrompt += `

  Guidelines:
  - Keep responses short and helpful
  - If you don't know something, ask the customer to contact support
  - Always be polite and professional
  - Don't make up information
  - Ask for clarification when needed
  - Help with basic inquiries
  `;

  // Simple keyword-based responses for demo (no API key needed)
  const userMsg = userMessage.toLowerCase();

  // Greeting
  if (userMsg.includes('hi') || userMsg.includes('hello') || userMsg.includes('hey')) {
    return greetingMessage || 'Hi! Thanks for reaching out. How can I help you today?';
  }

  // Pricing
  if (userMsg.includes('price') || userMsg.includes('cost') || userMsg.includes('pricing') || userMsg.includes('fee')) {
    if (pricing) {
      return pricing;
    }
    return 'Our pricing varies based on your needs. Would you like me to share more details?';
  }

  // Services
  if (userMsg.includes('service') || userMsg.includes('what do you do') || userMsg.includes('help')) {
    if (services) {
      return `We offer: ${services}. Which service are you interested in?`;
    }
    return 'We offer various business solutions. What specific help do you need?';
  }

  // Contact
  if (userMsg.includes('contact') || userMsg.includes('phone') || userMsg.includes('email') || userMsg.includes('reach')) {
    return 'You can reach us through this chat. We\'ll get back to you within 24 hours!';
  }

  // About
  if (userMsg.includes('about') || userMsg.includes('who are you')) {
    return `I'm ${businessName || 'the AI assistant'} - here to help you with your questions!`;
  }

  // Book/Appointment
  if (userMsg.includes('book') || userMsg.includes('appointment') || userMsg.includes('schedule')) {
    return 'I\'d be happy to help you book an appointment! Would you like me to check available slots?';
  }

  // Thank you
  if (userMsg.includes('thank') || userMsg.includes('thanks')) {
    return 'You\'re welcome! Is there anything else I can help you with?';
  }

  // Bye
  if (userMsg.includes('bye') || userMsg.includes('goodbye') || userMsg.includes('see you')) {
    return 'Thank you for chatting with us! Have a great day! Come back anytime.';
  }

  // Default smart response
  const responses = [
    'Thanks for your message! Let me connect you with our team for more details.',
    'I appreciate your interest! Could you tell me more about what you\'re looking for?',
    'Great question! I\'d be happy to help you with that.',
    'Thanks for reaching out! What specific information do you need?',
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

// WhatsApp Webhook - Handle incoming messages with AI auto-reply
router.post('/whatsapp-webhook', async (req: Request, res: Response) => {
  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    for (const msg of messages) {
      const phone = msg.from;
      const messageText = msg.text?.body || '';

      if (!messageText) continue;

      // Find or create lead
      let lead = await prisma.lead.findUnique({ where: { phone } });

      if (!lead) {
        // No userId provided, create with a default user for demo
        const demoUser = await prisma.user.findFirst();
        if (!demoUser) continue;

        lead = await prisma.lead.create({
          data: {
            phone,
            userId: demoUser.id,
            name: msg.profile?.name || `Customer ${phone.slice(-4)}`,
            status: 'NEW',
          },
        });
      }

      // Save incoming message
      await prisma.message.create({
        data: {
          content: messageText,
          direction: 'INCOMING',
          status: 'DELIVERED',
          leadId: lead.id,
          userId: lead.userId,
        },
      });

      // Get AI settings
      const business = await prisma.business.findUnique({ where: { userId: lead.userId } });
      const settings = business?.id
        ? await prisma.aISettings.findUnique({ where: { businessId: business.id } })
        : null;

      // Check if AI is enabled
      if (settings?.isEnabled === false) {
        continue; // Skip auto-reply
      }

      // Generate AI response
      const aiResponse = await generateAIResponse(messageText, settings, business);

      // Simulate delay if configured
      const delay = settings?.autoReplyDelay ?? 0;
      if (delay > 0) {
        await new Promise(r => setTimeout(r, delay * 1000));
      }

      // Save AI response
      await prisma.message.create({
        data: {
          content: aiResponse,
          direction: 'OUTGOING',
          status: 'SENT',
          leadId: lead.id,
          userId: lead.userId,
        },
      });

      // Update lead
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          lastMessage: aiResponse,
          status: 'CONTACTED',
        },
      });
    }

    res.json({ success: true, message: 'Processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Test AI Response endpoint
router.post('/test-ai', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req as any;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const business = await prisma.business.findUnique({ where: { userId } });
    const settings = business?.id
      ? await prisma.aISettings.findUnique({ where: { businessId: business.id } })
      : null;

    const response = await generateAIResponse(message, settings, business);

    res.json({
      response,
      settings: {
        isEnabled: settings?.isEnabled,
        tone: settings?.tone,
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;