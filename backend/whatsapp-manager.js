/**
 * MJ AI WhatsApp Manager
 * Support for multiple WhatsApp numbers
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', credentials: true }
});

app.use(express.json());

// ========== MULTI-NUMBER SUPPORT ==========
const sessionsPath = './whatsapp-sessions';
if (!fs.existsSync(sessionsPath)) {
  fs.mkdirSync(sessionsPath, { recursive: true });
}

// Active WhatsApp clients
const whatsappClients = new Map(); // { clientId: Client }
const clientStatus = new Map(); // { clientId: { status, qr, name, number } }
const contextBuffer = new Map();
const userPreferences = new Map();
const MAX_MESSAGES = 10;

// ========== MJ AI SYSTEM PROMPT ==========
const SYSTEM_PROMPT = `You are MJ AI - a professional business assistant.

PRICING:
- FREE: $0/mo - 100 messages/mo, Basic AI
- PRO: $29/mo - Unlimited messages, Advanced AI, 5 users
- ENTERPRISE: $99/mo - Custom AI, Unlimited users, 24/7 Support

RULES:
1. Never break character
2. If asked pricing, give specific plan details
3. Reply as "I am MJ, your business assistant"
4. Only process text messages
5. Be warm for greetings, professional for complaints
`;

// ========== INTENT RECOGNITION ==========
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|namaste|i|yo|sup)\b/.test(t)) return 'GREETING';
  if (/\b(price|cost|fee|kitna|kon|amount|paise)\b/.test(t)) return 'PRICING';
  if (/\b(pro|upgrade|paid)\b/.test(t)) return 'PRO_QUERY';
  if (/\b(enterprise|company|bulk|team)\b/.test(t)) return 'ENTERPRISE_QUERY';
  if (/\b(free|trial|try)\b/.test(t)) return 'FREE_QUERY';
  if (/\b(contact|phone|call|mail|reach)\b/.test(t)) return 'CONTACT';
  if (/\b(service|help|support)\b/.test(t)) return 'SERVICE';
  if (/\b(book|appointment|schedule)\b/.test(t)) return 'BOOKING';
  if (/\b(complaint|problem|issue|error|worst|bad)\b/.test(t)) return 'COMPLAINT';
  if (/\b(thanks|thank|shukriya)\b/.test(t)) return 'THANKS';
  if (/\b(bye|goodbye|tata)\b/.test(t)) return 'GOODBYE';
  if (/\b(stop|disable|unsubscribe)\b/.test(t)) return 'STOP';
  if (/\b(start|enable|subscribe|resume)\b/.test(t)) return 'START';
  return 'GENERAL';
}

// ========== AI RESPONSE ENGINE ==========
function getAIResponse(text, remoteJid) {
  const intent = detectIntent(text);
  const isAutoReplyEnabled = userPreferences.get(remoteJid)?.autoreply ?? true;

  if (!isAutoReplyEnabled) {
    return "🤖 Autoreply disabled. Send 'START' to resume.";
  }

  const t = text.toLowerCase().trim();

  switch (intent) {
    case 'GREETING':
      return ["🙏 Namaste! How can I help you today?", "👋 Hello! I'm MJ. What would you like to know?", "✨ Hi there! Ready to help!"][Math.floor(Math.random() * 3)];

    case 'PRICING':
      return `💰 Our Plans:\n📦 FREE: $0/mo - 100 msgs\n⭐ PRO: $29/mo - Unlimited\n🏢 ENTERPRISE: $99/mo\n\nWhich one interests you?`;

    case 'PRO_QUERY':
      return "⭐ PRO Plan - $29/month:\n✅ Unlimited messages\n✅ Advanced AI\n✅ 5 user seats\n✅ Priority support\n\nWant to upgrade?";

    case 'ENTERPRISE_QUERY':
      return "🏢 Enterprise - $99/month:\n✅ Custom AI\n✅ Unlimited users\n✅ 24/7 Support\n✅ API access\n\nContact us for custom solutions!";

    case 'FREE_QUERY':
      return "📦 Free Plan - $0/month:\n✅ 100 messages/mo\n✅ Basic AI\n✅ 1 user seat\n\nGreat to get started!";

    case 'CONTACT':
      return "📞 Contact:\n💬 WhatsApp: Message here\n📧 Email: support@mjai.business\n🌐 Website: mjai.business";

    case 'SERVICE':
      return "🛠️ Our Services:\n• WhatsApp AI Automation\n• Lead Management\n• Appointment Booking\n• Customer Support Bot";

    case 'BOOKING':
      return "📅 To book, tell me:\n1. Preferred date\n2. Time slot\n3. Your name";

    case 'COMPLAINT':
      return "😔 I apologize for any inconvenience. Please share details so I can help resolve this.";

    case 'THANKS':
      return "😊 You're welcome! Anything else?";

    case 'GOODBYE':
      return "👋 Thank you! Have a great day!";

    case 'STOP':
      userPreferences.set(remoteJid, { autoreply: false });
      return "✅ Autoreply disabled. Send 'START' to resume.";

    case 'START':
      userPreferences.set(remoteJid, { autoreply: true });
      return "✅ Autoreply enabled!";

    default:
      return "Thanks for your message! Our team will get back to you soon. For immediate help, call us!";
  }
}

function addContext(remoteJid, message) {
  if (!contextBuffer.has(remoteJid)) {
    contextBuffer.set(remoteJid, []);
  }
  const ctx = contextBuffer.get(remoteJid);
  ctx.push({ text: message, timestamp: Date.now() });
  if (ctx.length > MAX_MESSAGES) {
    ctx.shift();
  }
}

// ========== CREATE WHATSAPP CLIENT ==========
function createWhatsAppClient(clientId, clientName) {
  const sessionPath = path.join(sessionsPath, clientId);

  // Clear old session
  if (fs.existsSync(sessionPath)) {
    try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch(e) {}
  }

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: sessionPath,
      clientId: clientId,
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
      ],
    },
  });

  // Initialize status
  clientStatus.set(clientId, {
    status: 'STARTING',
    qr: null,
    name: clientName,
    number: null,
  });

  // QR Event
  client.on('qr', (qr) => {
    console.log(`📱 QR for ${clientId}`);
    clientStatus.set(clientId, { ...clientStatus.get(clientId), status: 'AUTHENTICATING', qr });
    io.emit(`qr:${clientId}`, qr);
    io.emit('status:update', { clientId, status: 'AUTHENTICATING', qr });
  });

  // Authenticated
  client.on('authenticated', () => {
    console.log(`✅ ${clientId} authenticated`);
    clientStatus.set(clientId, { ...clientStatus.get(clientId), status: 'AUTHENTICATED', qr: null });
    io.emit('status:update', { clientId, status: 'AUTHENTICATED' });
  });

  // Ready
  client.on('ready', () => {
    const number = client.info?.wid?.user;
    console.log(`📲 ${clientId} ready: ${number}`);
    clientStatus.set(clientId, { ...clientStatus.get(clientId), status: 'CONNECTED', number, qr: null });
    io.emit('status:update', { clientId, status: 'CONNECTED', number });
  });

  // Disconnected
  client.on('disconnected', () => {
    console.log(`❌ ${clientId} disconnected`);
    clientStatus.set(clientId, { ...clientStatus.get(clientId), status: 'DISCONNECTED' });
    io.emit('status:update', { clientId, status: 'DISCONNECTED' });
  });

  // Message Handler - INSTANT REPLY!
  client.on('message', async (msg) => {
    if (!msg || !msg.body || msg.fromMe || msg.chat?.isGroup) return;

    const text = msg.body.trim();
    const remoteJid = msg.from;

    console.log(`�� ${clientId}: ${msg.from}: ${text}`);

    // Add to context
    addContext(remoteJid, text);

    // Get instant response (NO DELAY!)
    const response = getAIResponse(text.toLowerCase(), remoteJid);

    // Send instantly!
    try {
      await msg.reply(response);
      console.log(`🤖 ${clientId} replied: ${response.substring(0, 30)}...`);
    } catch (e) {
      console.error(`❌ Reply error: ${e.message}`);
    }
  });

  // Initialize
  client.initialize();
  whatsappClients.set(clientId, client);

  return client;
}

// ========== ADMIN API ==========

// List all clients
app.get('/api/clients', (req, res) => {
  const clients = [];
  clientStatus.forEach((status, clientId) => {
    clients.push({ clientId, ...status });
  });
  res.json({ clients });
});

// Add new client
app.post('/api/clients', (req, res) => {
  const { clientId, name } = req.body;

  if (whatsappClients.has(clientId)) {
    return res.status(400).json({ error: 'Client already exists' });
  }

  createWhatsAppClient(clientId, name || clientId);
  res.json({ success: true, clientId, message: 'Client created, scan QR to connect' });
});

// Remove client
app.delete('/api/clients/:clientId', (req, res) => {
  const { clientId } = req.params;

  if (!whatsappClients.has(clientId)) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const client = whatsappClients.get(clientId);
  client.destroy();
  whatsappClients.delete(clientId);
  clientStatus.delete(clientId);

  res.json({ success: true, message: 'Client removed' });
});

// Get client status
app.get('/api/clients/:clientId', (req, res) => {
  const { clientId } = req.params;
  const status = clientStatus.get(clientId);

  if (!status) {
    return res.status(404).json({ error: 'Client not found' });
  }

  res.json({ clientId, ...status });
});

// Get client QR
app.get('/api/clients/:clientId/qr', (req, res) => {
  const { clientId } = req.params;
  const status = clientStatus.get(clientId);

  if (!status || !status.qr) {
    return res.status(404).json({ error: 'No QR available' });
  }

  res.json({ qr: status.qr });
});

// Send message from client
app.post('/api/clients/:clientId/send', (req, res) => {
  const { clientId } = req.params;
  const { to, message } = req.body;

  const client = whatsappClients.get(clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client not connected' });
  }

  client.sendMessage(to, message)
    .then(result => res.json({ success: true, id: result.id._serialized }))
    .catch(e => res.status(400).json({ error: e.message }));
});

// Create default client on startup
createWhatsAppClient('default', 'Business Bot');

// ========== SOCKET.IO ==========
io.on('connection', (socket) => {
  console.log(`🔌 Client: ${socket.id}`);

  // Send all client statuses
  const statuses = [];
  clientStatus.forEach((status, clientId) => {
    statuses.push({ clientId, ...status, qr: undefined }); // Don't send QR via socket for security
  });
  socket.emit('allstatus', statuses);

  // Client-specific events
  socket.on('subscribe', (clientId) => {
    socket.join(`client:${clientId}`);
    const status = clientStatus.get(clientId);
    if (status) socket.emit(`status:${clientId}`, status);
  });
});

// ========== SERVER ==========
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 MJ AI Manager running on http://localhost:${PORT}`);
  console.log(`📱 Default client ready for QR scan`);
});

module.exports = { app, io };