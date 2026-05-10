/**
 * WhatsApp QR + Status Server
 * Node.js/Express + Socket.io + whatsapp-web.js
 *
 * Fedora-compatible with --no-sandbox
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', credentials: true }
});

app.use(express.json());

// ========== MJ AI SYSTEM PROMPT ==========
const SYSTEM_PROMPT = `You are MJ AI - a professional business assistant for WhatsApp automation服务.

BUSINESS KNOWLEDGE:
- Business: AI-powered WhatsApp automation for businesses
- Company: MJ AI Business Solutions

PRICING PLANS:
- FREE: $0/month - 100 messages/mo, Basic AI, 1 user seat
- PRO: $29/month - Unlimited messages, Advanced AI, 5 user seats, Priority support
- ENTERPRISE: $99/month - Custom AI models, Unlimited users, 24/7 Support

RULES:
1. Never break character - you are MJ AI
2. If asked about pricing, give specific plan details above
3. If asked "Who are you?", reply: "I am MJ, your intelligent business assistant."
4. Only process text messages - for images/media say "I currently only process text messages, but I'm learning fast!"
5. Be warm for greetings, professional for complaints
6. Remember conversation context (last 10 messages)
`;

// ========== CONTEXT MEMORY ==========
const contextBuffer = new Map(); // Stores last 10 messages per user
const MAX_MESSAGES = 10;

// User preferences (STOP/START)
const userPreferences = new Map(); // { remoteJid: { autoreply: boolean } }

function getContext(remoteJid) {
  if (!contextBuffer.has(remoteJid)) {
    contextBuffer.set(remoteJid, []);
  }
  return contextBuffer.get(remoteJid);
}

function addContext(remoteJid, message) {
  const ctx = getContext(remoteJid);
  ctx.push({ text: message, timestamp: Date.now() });
  if (ctx.length > MAX_MESSAGES) {
    ctx.shift();
  }
}

// ========== INTENT RECOGNITION ==========
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|namaste|hi|i|yo|sup)\b/.test(t)) return 'GREETING';
  if (/\b(price|cost|fee|kitna|kon|amount|paise)\b/.test(t)) return 'PRICING';
  if (/\b(pro|professional|upgrade|paid)\b/.test(t)) return 'PRO_QUERY';
  if (/\b(enterprise|company|bulk|team)\b/.test(t)) return 'ENTERPRISE_QUERY';
  if (/\b(free|trial|try|zero)\b/.test(t)) return 'FREE_QUERY';
  if (/\b(contact|phone|call|email|reach|mail)\b/.test(t)) return 'CONTACT';
  if (/\b(service|help|support|assist)\b/.test(t)) return 'SERVICE';
  if (/\b(book|appointment|schedule|meeting|date)\b/.test(t)) return 'BOOKING';
  if (/\b(complaint|problem|issue|not working|bug|error|worst|bad)\b/.test(t)) return 'COMPLAINT';
  if (/\b(thanks|thank|shukriya|appreciate)\b/.test(t)) return 'THANKS';
  if (/\b(bye|goodbye|tata|see you|laters)\b/.test(t)) return 'GOODBYE';
  if (/\b(stop|disable|unsubscribe|leave)\b/.test(t)) return 'STOP';
  if (/\b(start|enable|subscribe|resume)\b/.test(t)) return 'START';
  return 'GENERAL';
}

// ========== AI RESPONSE ENGINE ==========
function getAIResponse(text, remoteJid) {
  const intent = detectIntent(text);
  const context = getContext(remoteJid).map(m => m.text).join(' | ');
  const isAutoReplyEnabled = userPreferences.get(remoteJid)?.autoreply ?? true;

  if (!isAutoReplyEnabled) {
    return "🤖 Autoreply disabled. Send 'START' to resume.";
  }

  // Check for media/links
  const hasMedia = /(\.(jpg|png|gif|mp4|mp3|pdf|doc))/i.test(text);
  const hasUrl = /(https?:\/\/|www\.)/i.test(text);
  if (hasMedia && text.length < 50) {
    return "📎 I currently only process text messages, but I'm learning fast!";
  }

  const t = text.toLowerCase().trim();

  switch (intent) {
    case 'GREETING':
      const greetings = [
        "🙏 Namaste! How can I help you today?",
        "👋 Hello! I'm MJ, your business assistant. What would you like to know?",
        "✨ Hi there! Ready to help with your queries."
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];

    case 'PRICING':
      return `💰 Our Plans:\n\n📦 FREE: $0/mo - 100 msgs/mo, Basic AI\n\n⭐ PRO: $29/mo - Unlimited msgs, Advanced AI, 5 users\n\n🏢 ENTERPRISE: $99/mo - Custom AI, Unlimited users, 24/7 Support\n\nWhich plan interests you?`;

    case 'PRO_QUERY':
      return `⭐ PRO Plan - $29/month:\n\n✅ Unlimited messages\n✅ Advanced AI features\n✅ 5 user seats\n✅ Priority support\n\nPerfect for growing businesses! Want to upgrade?`;

    case 'ENTERPRISE_QUERY':
      return `🏢 Enterprise Plan - $99/month:\n\n✅ Custom AI models\n✅ Unlimited users & messages\n✅ 24/7 dedicated support\n✅ API access\n\nBest for teams! Contact us for custom solutions.`;

    case 'FREE_QUERY':
      return `📦 Free Plan - $0/month:\n\n✅ 100 messages/month\n✅ Basic AI responses\n✅ 1 user seat\n\nGreat to get started! Want to explore PRO features?`;

    case 'CONTACT':
      return `📞 Contact Us:\n\n💬 WhatsApp: Message us here\n📧 Email: support@mjai.business\n🌐 Website: mjai.business\n\nWe respond within 24 hours!`;

    case 'SERVICE':
      return `🛠️ Our Services:\n\n• WhatsApp AI Automation\n• Lead Management\n• Appointment Booking\n• Customer Support Bot\n• Custom Integrations\n\nWhat would you like to know more about?`;

    case 'BOOKING':
      return `📅 Booking Inquiry:\n\nI'd be happy to help schedule a consultation!\n\nPlease tell me:\n1. Preferred date\n2. Time slot\n3. Your name & company (if any)`;

    case 'COMPLAINT':
      return `😔 I sincerely apologize for any inconvenience. Your feedback matters to us.\n\nPlease share details so I can forward to our team:\n• What happened?\n• When?\n\nWe'll resolve this ASAP.`;

    case 'THANKS':
      return `😊 You're welcome! Happy to help. Anything else?`;

    case 'GOODBYE':
      return `👋 Thank you for chatting! Have a great day & success with your business!`;

    case 'STOP':
      userPreferences.set(remoteJid, { autoreply: false });
      return "✅ Autoreply disabled. Send 'START' to resume.";

    case 'START':
      userPreferences.set(remoteJid, { autoreply: true });
      return "✅ Autoreply enabled! I'm here to help.";

    default:
      // Check context for follow-up
      if (context.includes('price') && /\b(yes|ok|sure|interested|go)\b/i.test(text)) {
        return "Great! Would you like me to connect you with our team?";
      }
      if (context.includes('book') && /\d/.test(text)) {
        return "📅 Got it! I'll confirm your appointment and send details shortly.";
      }
      return "Thanks for your message! Our team will get back to you soon. For immediate assistance, call us!";
  }
}

// ========== WHATSAPP CLIENT ==========
const fs = require('fs');
const sessionPath = './.wwebjs-session';

// Only clear if session is corrupted (don't clear on every startup!)
// if (fs.existsSync(sessionPath)) {
//   try {
//     fs.rmSync(sessionPath, { recursive: true, force: true });
//     console.log('🗑️ Cleared old session');
//   } catch (e) {
//     console.log('⚠️ Could not clear session:', e.message);
//   }
// }

const whatsapp = new Client({
  authStrategy: new LocalAuth({
    dataPath: sessionPath,
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--single-process',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ],
  },
});

// Status state
let waStatus = 'DISCONNECTED';
let qrCode = null;

// ========== WHATSAPP EVENTS ==========

// QR Code generated
whatsapp.on('qr', (qr) => {
  console.log('📱 QR Received');
  waStatus = 'AUTHENTICATING';
  qrCode = qr;

  // Send to all connected clients - match frontend event name
  io.emit('qr', qr);
  io.emit('whatsapp-status', { status: waStatus, qrCode: qr, isAIMode: true });
  io.emit('status', { status: waStatus, connected: false });
});

// Authenticated (first scan complete)
whatsapp.on('authenticated', () => {
  console.log('✅ Authenticated');
  waStatus = 'AUTHENTICATED';
  io.emit('whatsapp-status', { status: waStatus, qrCode: null, isAIMode: true });
  io.emit('status', { status: waStatus, connected: false });
});

// Auth failed
whatsapp.on('auth_failure', (msg) => {
  console.log('❌ Auth failed:', msg);
  waStatus = 'DISCONNECTED';
  qrCode = null;
  io.emit('whatsapp-status', { status: waStatus, qrCode: null, isAIMode: true });
  io.emit('status', { status: waStatus, connected: false });
});

// Ready (fully connected)
whatsapp.on('ready', () => {
  console.log('📲 WhatsApp Ready!');
  waStatus = 'CONNECTED';
  qrCode = null;

  io.emit('whatsapp-status', { status: waStatus, qrCode: null, isAIMode: true });
  io.emit('status', { status: waStatus, connected: true });
  io.emit('connected');
});

// Disconnected
whatsapp.on('disconnected', () => {
  console.log('❌ Disconnected');
  waStatus = 'DISCONNECTED';
  qrCode = null;
  io.emit('status', {
    status: waStatus,
    connected: false
  });
});

// Messages - Context-Aware AI Engine
whatsapp.on('message', async (msg) => {
  try {
    // Safety checks - be very defensive
    if (!msg) return;
    const msgBody = msg.body;
    const msgFrom = msg.from;
    const isFromMe = msg.fromMe;

    // Skip own messages
    if (isFromMe) {
      console.log('📤 Skipping own message');
      return;
    }

    // Skip if no text
    if (!msgBody || msgBody.trim() === '') {
      console.log('📭 Empty message, skipping');
      return;
    }

    const text = msgBody.trim();
    const remoteJid = msgFrom;

    console.log(`📩 INCOMING: ${msgFrom}: ${text}`);

    // Get AI response
    const response = getAIResponse(text.toLowerCase(), remoteJid);

    console.log(`🤖 Replying: ${response.substring(0, 50)}...`);

    // Anti-ban delay
    const delay = 2000 + Math.random() * 2000;
    await new Promise(r => setTimeout(r, delay));

    // Send reply
    await msg.reply(response);

    console.log(`✅ Reply sent!`);
  } catch (err) {
    console.log('❌ Error in message handler:', err.message);
  }
});

// Start WhatsApp
whatsapp.initialize();

// ========== REST API ==========

app.get('/api/status', (req, res) => {
  res.json({ status: waStatus, connected: waStatus === 'CONNECTED' });
});

app.get('/api/qr', (req, res) => {
  if (qrCode) {
    res.json({ qr: qrCode });
  } else {
    res.json({ qr: null, status: waStatus });
  }
});

app.post('/api/send', async (req, res) => {
  const { to, message } = req.body;
  try {
    const result = await whatsapp.sendMessage(to, message);
    res.json({ success: true, id: result.id._serialized });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ========== SOCKET.IO ==========

io.on('connection', (socket) => {
  console.log(`🔌 Client: ${socket.id}`);

  // Send current status on connect
  socket.emit('status', {
    status: waStatus,
    connected: waStatus === 'CONNECTED'
  });

  if (qrCode) {
    socket.emit('qr', qrCode);
  }

  // Request QR manually
  socket.on('get-qr', () => {
    if (qrCode) socket.emit('qr', qrCode);
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { app, whatsapp };