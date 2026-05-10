# MJ AI Business Assistant - Specification Document

## 1. Project Overview

**Project Name:** MJ AI Business Assistant
**Type:** SaaS Web Application
**Core Functionality:** AI-powered WhatsApp Business automation platform that enables businesses to connect their WhatsApp Business account and automate customer communication using AI
**Target Users:** Small to medium businesses, startups, entrepreneurs who use WhatsApp Business for customer communication

---

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Charts:** Recharts
- **Animations:** Framer Motion
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Google OAuth
- **AI Integration:** OpenAI API / Gemini API
- **Payment:** Stripe + Razorpay
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway/Render
- **Database:** PostgreSQL (Railway/RDS/Supabase)

---

## 3. UI/UX Specification

### Color Palette
```css
--primary: #10B981;        /* Emerald Green - brand color */
--primary-dark: #059669;
--primary-light: #34D399;
--secondary: #6366F1;     /* Indigo - accent */
--secondary-dark: #4F46E5;
--accent: #F59E0B;        /* Amber - highlights */

--dark-bg: #0A0A0F;       /* Deep dark background */
--dark-surface: #121218;     /* Card surfaces */
--dark-border: #1E1E2E;    /* Borders */
--dark-hover: #1A1A24;     /* Hover states */

--light-bg: #F8FAFC;       /* Light background */
--light-surface: #FFFFFF;
--light-border: #E2E8F0;

--text-primary: #FFFFFF;
--text-secondary: #A1A1AA;
--text-muted: #71717A;

--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Typography
- **Headings:** "Plus Jakarta Sans" (700, 600)
- **Body:** "Plus Jakarta Sans" (400, 500)
- **Monospace:** "JetBrains Mono"

### Spacing System
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Effects
- **Glassmorphism:** backdrop-blur-xl, bg-opacity-80
- **Shadows:** 0 4px 24px rgba(0, 0, 0, 0.25)
- **Gradients:** Linear gradients with brand colors
- **Animations:** Smooth 300ms transitions, staggered reveals

---

## 4. Page Structure

### 4.1 Landing Page (/)
**Sections:**
1. **Navigation Bar** - Logo, Features, Pricing, FAQ, Login, Get Started
2. **Hero Section** - Headline, subheadline, CTA buttons, AI chat demo
3. **Trusted By** - Company logos
4. **Features Section** - 6 key features with icons
5. **AI Demo Section** - Interactive chatbot demo
6. **Testimonials** - Customer reviews
7. **Pricing Section** - 3 plans (Free, Pro, Enterprise)
8. **FAQ Section** - Expandable questions
9. **Footer** - Links, social, legal

### 4.2 Authentication Pages
- **/login** - Email/password login + Google login
- **/register** - Sign up form
- **/forgot-password** - Password reset

### 4.3 Dashboard (/dashboard)
**Layout:** Sidebar + Main Content
**Sections:**
1. **Sidebar** - Logo, nav links, user menu
2. **Header** - Search, notifications, profile
3. **Stats Cards** - 4 KPI cards
4. **Charts** - Usage analytics, conversation trends
5. **Recent Chats** - Last 5 conversations
6. **Quick Actions** - Connect WhatsApp, settings

### 4.4 WhatsApp Connection (/dashboard/whatsapp)
- QR Code scanner
- Connection status
- Message history

### 4.5 Leads Management (/dashboard/leads)
- Leads table with search/filter
- Lead details modal
- Export CSV button
- Tag management

### 4.6 AI Settings (/dashboard/settings)
- AI toggle
- Tone selector
- Business info form
- Custom instructions
- Auto-reply delay
- Greeting messages

### 4.7 Appointments (/dashboard/appointments)
- Calendar view
- Booking slots
- Appointment list

### 4.8 Billing (/dashboard/billing)
- Current plan
- Upgrade options
- Payment history
- Invoice download

### 4.9 Admin Panel (/admin)
- User management
- Subscription overview
- Analytics dashboard
- Account actions

---

## 5. Database Schema

### Users
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  password       String?
  image           String?
  role            Role     @default(USER)
  provider        Provider @default(EMAIL)
  isActive        Boolean  @default(true)
  subscriptionId  String?
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
  business        Business?
  leads           Lead[]
  messages        Message[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Business
```prisma
model Business {
  id              String   @id @default(cuid())
  name            String
  description     String?
  phone           String?
  address         String?
  logo            String?
  whatsappNumber String?
  whatsappToken  String?
  isConnected     Boolean  @default(false)
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  settings        AISettings?
  appointments   Appointment[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### AISettings
```prisma
model AISettings {
  id                  String   @id @default(cuid())
  businessId          String   @unique
  business            Business @relation(fields: [businessId], references: [id])
  isEnabled           Boolean  @default(true)
  tone                String   @default("professional")
  greetingMessage    String?
  customInstructions  String?
  autoReplyDelay     Int      @default(0)
  businessName       String?
  pricing            String?
  services           String[]
  faqs               Json?
  openingHours       Json?
  language           String   @default("en")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### Lead
```prisma
model Lead {
  id          String   @id @default(cuid())
  name        String?
  phone       String   @unique
  email       String?
  lastMessage String?
  tags        String[]
  status      LeadStatus @default(NEW)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  messages    Message[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Message
```prisma
model Message {
  id          String      @id @default(cuid())
  content     String
  direction   Direction
  status      MessageStatus @default(DELIVERED)
  leadId      String
  lead        Lead        @relation(fields: [leadId], references: [id])
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  createdAt   DateTime    @default(now())
}
```

### Subscription
```prisma
model Subscription {
  id              String   @id @default(cuid())
  plan            Plan    @default(FREE)
  status          SubStatus @default(ACTIVE)
  razorpaySubId   String?
  stripeSubId    String?
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  users           User[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Appointment
```prisma
model Appointment {
  id          String   @id @default(cuid())
  title       String
  date        DateTime
  duration    Int      @default(60)
  status      AppointmentStatus @default(PENDING)
  notes       String?
  leadId      String
  businessId  String
  business    Business @relation(fields: [businessId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Analytics
```prisma
model Analytics {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @db.Date
  totalMessages   Int      @default(0)
  aiReplies       Int      @default(0)
  leadsGenerated  Int      @default(0)
  conversations   Int      @default(0)
  createdAt       DateTime @default(now())
}
```

### Enums
```prisma
enum Role { USER, ADMIN }
enum Provider { EMAIL, GOOGLE }
enum Plan { FREE, PRO, ENTERPRISE }
enum SubStatus { ACTIVE, CANCELLED, PAST_DUE }
enum LeadStatus { NEW, CONTACTED, CONVERTED, LOST }
enum Direction { INCOMING, OUTGOING }
enum MessageStatus { SENT, DELIVERED, READ, FAILED }
enum AppointmentStatus { PENDING, CONFIRMED, CANCELLED, COMPLETED }
```

---

## 6. API Routes

### Auth Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### User Routes
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Business Routes
- `POST /api/business` - Create business
- `GET /api/business` - Get business
- `PUT /api/business` - Update business
- `POST /api/business/connect-whatsapp` - Connect WhatsApp

### AI Settings Routes
- `GET /api/ai-settings` - Get settings
- `PUT /api/ai-settings` - Update settings

### Leads Routes
- `GET /api/leads` - Get leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/export` - Export CSV

### Messages Routes
- `GET /api/messages/:leadId` - Get messages
- `POST /api/messages` - Send message

### Appointments Routes
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Subscriptions Routes
- `GET /api/subscriptions` - Get subscription
- `POST /api/subscriptions/upgrade` - Upgrade plan
- `POST /api/subscriptions/cancel` - Cancel subscription

### Webhook Routes
- `POST /api/webhooks/razorpay` - Razorpay webhook
- `POST /api/webhooks/stripe` - Stripe webhook
- `POST /api/webhooks/whatsapp` - WhatsApp webhook

### Analytics Routes
- `GET /api/analytics` - Get analytics

---

## 7. UI Components

### Shared Components
- Button (primary, secondary, ghost, outline)
- Input (text, email, password, number)
- Select
- Checkbox
- Switch
- Card
- Modal
- Dropdown
- Avatar
- Badge
- Toast
- Skeleton
- Table
- Tabs

### Layout Components
- Navbar
- Sidebar
- Header
- Footer

### Feature Components
- StatsCard
- Chart
- LeadCard
- MessageBubble
- Calendar
- PricingCard

---

## 8. Acceptance Criteria

### Landing Page
- [ ] Hero section loads with animation
- [ ] All sections scroll smoothly
- [ ] Responsive on all devices
- [ ] CTA buttons navigate correctly

### Authentication
- [ ] Email/password login works
- [ ] Google login redirects
- [ ] Form validation shows errors
- [ ] Session persists

### Dashboard
- [ ] Stats load from API
- [ ] Charts render correctly
- [ ] Recent chats show latest
- [ ] Quick actions work

### WhatsApp Integration
- [ ] QR code displays
- [ ] Connection status updates
- [ ] Messages sync in real-time

### AI Auto Reply
- [ ] AI responds to messages
- [ ] Multi-language support works
- [ ] Custom instructions applied

### Leads Management
- [ ] Leads display in table
- [ ] Search/filter works
- [ ] Export CSV works

### Billing
- [ ] Plan comparison shows
- [ ] Payment integration works
- [ ] History displays

### Admin Panel
- [ ] Users list loads
- [ ] Actions work
- [ ] Analytics display

---

## 9. File Structure

```
mj-ai-business-assistant/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── whatsapp/
│   │   │   │   ├── leads/
│   │   │   │   ├── settings/
│   │   │   │   ├── appointments/
│   │   │   │   ├── billing/
│   │   │   │   └── layout.tsx
│   │   │   └── admin/
│   │   ├── (landing)/
│   │   │   ├── features/
│   │   │   ├── pricing/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   └── features/
│   ├── lib/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   └── styles/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│   ├── prisma/
│   └── package.json
└── README.md
```