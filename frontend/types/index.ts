export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  provider: 'EMAIL' | 'GOOGLE';
  isActive: boolean;
  subscriptionId: string | null;
  subscription?: Subscription;
  business?: Business;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  whatsappNumber: string | null;
  whatsappToken: string | null;
  isConnected: boolean;
  userId: string;
  settings?: AISettings;
  createdAt: string;
  updatedAt: string;
}

export interface AISettings {
  id: string;
  businessId: string;
  isEnabled: boolean;
  tone: string;
  greetingMessage: string | null;
  customInstructions: string | null;
  autoReplyDelay: number;
  businessName: string | null;
  pricing: string | null;
  services: string[];
  faqs: Record<string, string> | null;
  openingHours: Record<string, string> | null;
  language: string;
}

export interface Lead {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  lastMessage: string | null;
  tags: string[];
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'LOST';
  userId: string;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  direction: 'INCOMING' | 'OUTGOING';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  leadId: string;
  userId: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE' | string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | string;
  razorpaySubId: string | null;
  stripeSubId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  leadId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  id: string;
  userId: string;
  date: string;
  totalMessages: number;
  aiReplies: number;
  leadsGenerated: number;
  conversations: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}