import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import businessRoutes from './routes/business';
import leadsRoutes from './routes/leads';
import messagesRoutes from './routes/messages';
import settingsRoutes from './routes/settings';
import appointmentsRoutes from './routes/appointments';
import subscriptionsRoutes from './routes/subscriptions';
import analyticsRoutes from './routes/analytics';
import webhookRoutes from './routes/webhooks';
import aiReplyRoutes from './routes/ai-reply';
// WhatsApp temporarily disabled - running on port 5001
// let whatsapp: any;
// try {
//   whatsapp = new WhatsAppController(io);
// } catch (e) {
//   console.error('❌ WhatsApp init failed:', e);
// }

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// WhatsApp disabled (running on port 5001)
let whatsapp: any = null;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

app.locals.prisma = prisma;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' },
});
app.use('/api/', limiter);

// 📱 WhatsApp running on port 5001 (separate server)
// let whatsapp: any;
// try {
//   whatsapp = new WhatsAppController(io);
// } catch (e) {
//   console.error('❌ WhatsApp init failed:', e);
// }

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`📱 Client: ${socket.id}`);

  // Send current status
  // if (whatsapp) {
  //   socket.emit('whatsapp-status', whatsapp.getStatus());
  // }

  // AI Mode toggle
  socket.on('set-ai-mode', (data: { enabled: boolean }) => {
    // whatsapp?.setAIMode(data.enabled);
  });

  // Send message manually
  socket.on('send-message', async (data: { to: string; text: string }) => {
    try {
      const result = await whatsapp?.sendMessage(data.to, data.text);
      socket.emit('message-sent', { success: true, id: result?.id?._serialized });
    } catch (e: any) {
      socket.emit('message-sent', { success: false, error: e.message });
    }
  });

  // Request status
  socket.on('get-status', () => {
    socket.emit('whatsapp-status', whatsapp?.getStatus());
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/ai', aiReplyRoutes);

// 📱 WhatsApp Status Endpoint
app.get('/api/whatsapp/status', (req, res) => {
  res.json(whatsapp?.getStatus() || { status: 'ERROR', qrCode: null, isAIMode: false });
});

// 📱 AI Mode Toggle
app.post('/api/whatsapp/ai-mode', (req, res) => {
  const { enabled } = req.body;
  whatsapp?.setAIMode(enabled);
  res.json({ success: true, isAIMode: enabled });
});

// 📱 Manual Send
app.post('/api/whatsapp/send', (req, res) => {
  const { to, text } = req.body;
  whatsapp?.sendMessage(to, text)
    .then((r: any) => res.json({ success: true, id: r.id._serialized }))
    .catch((e: any) => res.status(400).json({ error: e.message }));
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📡 Shutting down...');
  whatsapp?.destroy();
  await prisma.$disconnect();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
});

export default app;