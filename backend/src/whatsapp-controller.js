/**
 * MJ AI WhatsApp Controller
 * Production-ready with AI Auto-reply
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  sessionPath: path.join(__dirname, '../.wwebjs-session'),
  minDelay: 2000,
  maxDelay: 5000,
  thinkingDelay: 1500,
  maxMessagesPerContact: 5,
};

class WhatsAppController {
  constructor(io) {
    this.io = io;
    this.client = null;
    this.status = 'DISCONNECTED';
    this.qrCode = null;
    this.isAIMode = true;
    this.messageCache = new Map();
    this.init();
  }

  init() {
    console.log('🔌 Starting WhatsApp Client...');

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: CONFIG.sessionPath }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
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

    this.client.on('qr', (qr) => {
      console.log('📱 QR Received');
      this.status = 'AUTHENTICATING';
      this.qrCode = qr;
      this.broadcastStatus();
    });

    this.client.on('authenticated', () => {
      console.log('✅ Authenticated!');
      this.status = 'AUTHENTICATED';
      this.broadcastStatus();
    });

    this.client.on('ready', () => {
      console.log('📲 WhatsApp Ready!');
      this.status = 'READY';
      this.broadcastStatus();
    });

    this.client.on('disconnected', () => {
      console.log('❌ Disconnected');
      this.status = 'DISCONNECTED';
      this.broadcastStatus();
    });

    this.client.on('message', async (msg) => {
      await this.handleMessage(msg);
    });

    this.client.initialize();
  }

  async handleMessage(message) {
    if (message.fromMe || message.chat.isGroup || message.id._isNotification) return;

    const contact = message.from;
    const text = message.body?.trim() || '';
    console.log(`📩 ${contact}: ${text.substring(0, 30)}`);

    if (!this.isAIMode) return;

    // Add to cache
    this.addToCache(contact, { content: text, direction: 'IN', time: new Date() });

    // Anti-ban delay
    await this.sleep(this.random(CONFIG.minDelay, CONFIG.maxDelay));

    // Typing indicator
    try { await message.chat.sendStateTyping(); } catch {}

    // Thinking delay
    await this.sleep(CONFIG.thinkingDelay);

    // Generate AI response
    const response = this.generateAIResponse(contact, text);

    // Send reply
    await this.client.sendMessage(contact, response);

    // Cache reply
    this.addToCache(contact, { content: response, direction: 'OUT', time: new Date() });

    console.log(`✅ Reply: ${response.substring(0, 30)}`);
  }

  generateAIResponse(phone, msg) {
    const m = msg.toLowerCase();
    const ctx = this.getContext(phone);

    // Greetings
    if (/\b(hi|hello|hey|namaste|good.?morning)\b/i.test(m)) {
      return '🙏 Namaste! Welcome to MJ AI. How can I help you today?';
    }
    // Pricing
    if (/\b(price|cost|fee|kitna|kita|rate)\b/i.test(m)) {
      return '💰 Our pricing depends on your needs. Tell me more about what you need?';
    }
    // Services
    if (/\b(service|help|what.?do|facility)\b/i.test(m)) {
      return '🛠️ We offer WhatsApp AI automation, lead management, booking system, and more.';
    }
    // Contact
    if (/\b(contact|phone|call|email|reach)\b/i.test(m)) {
      return '📞 Reach us through this chat! We respond within 24 hours.';
    }
    // Book
    if (/\b(book|appointment|schedule)\b/i.test(m)) {
      return '📅 Sure! Share your preferred date and time.';
    }
    // Thanks
    if (/\b(thank|thx|thanks)\b/i.test(m)) {
      return '😊 Welcome! Anything else?';
    }
    // Bye
    if (/\b(bye|goodbye|see.?you|tata)\b/i.test(m)) {
      return '👋 Thank you! Have a great day!';
    }

    const defaults = [
      '🌟 Thanks! Tell me more.',
      '💬 I understand. Share more details?',
      '✨ I\'ll help you with that.',
      '📩 What else would you like to know?',
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  addToCache(phone, msg) {
    const arr = this.messageCache.get(phone) || [];
    arr.push(msg);
    if (arr.length > CONFIG.maxMessagesPerContact) arr.shift();
    this.messageCache.set(phone, arr);
  }

  getContext(phone) {
    return this.messageCache.get(phone) || [];
  }

  broadcastStatus() {
    this.io?.emit('whatsapp-status', {
      status: this.status,
      qrCode: this.qrCode,
      isAIMode: this.isAIMode,
    });
  }

  setAIMode(enabled) {
    this.isAIMode = enabled;
    this.broadcastStatus();
  }

  getStatus() {
    return { status: this.status, qrCode: this.qrCode, isAIMode: this.isAIMode };
  }

  async destroy() {
    if (this.client) await this.client.destroy();
  }

  random(min, max) { return Math.floor(Math.random() * (max - min) + min); }
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

module.exports = WhatsAppController;