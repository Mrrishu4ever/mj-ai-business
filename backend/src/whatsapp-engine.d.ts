declare module './whatsapp-engine' {
  import { Server } from 'socket.io';

  interface AIServiceConfig {
    tone: string;
    greetingMessage: string | null;
    customInstructions: string | null;
    businessName: string;
    pricing: string | null;
    services: string | null;
  }

  class AIService {
    isEnabled: boolean;
    settings: AIServiceConfig;
    setSettings(settings: Partial<AIServiceConfig>): void;
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    generateResponse(params: { message: string; from: string; chat: any }): Promise<string>;
  }

  class WhatsAppEngine {
    constructor(io: Server, aiService: AIService);
    status: string;
    qrCode: string | null;
    loadSession(): void;
    saveSession(data: any): void;
    initialize(): Promise<void>;
    handleIncomingMessage(message: any): Promise<void>;
    sendMessage(to: string, text: string): Promise<any>;
    sendTypingIndicator(chatId: string, isTyping: boolean): Promise<void>;
    broadcastStatus(): void;
    destroy(): Promise<void>;
  }

  export function createWhatsAppRoutes(io: Server): {
    getStatus: () => { status: string; qrCode: string | null };
    updateSettings: (settings: any) => { success: boolean };
    toggleAI: (enabled: boolean) => { success: boolean; isEnabled: boolean };
    sendManualMessage: (to: string, text: string) => Promise<any>;
    destroy: () => Promise<void>;
    handleConnection: (socket: any) => void;
  };
}