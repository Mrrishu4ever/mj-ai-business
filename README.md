# MJ AI Business Assistant

A production-ready AI-powered WhatsApp Business automation SaaS platform built with Next.js 15, Node.js/Express, PostgreSQL, and Prisma.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **AI Auto Reply** - Smart AI that responds to WhatsApp messages automatically
- **Multi-Language Support** - English, Hindi, and Hinglish
- **Lead Management** - Capture and manage customer leads automatically
- **Appointment Booking** - Calendar integration for bookings
- **Analytics Dashboard** - Track messages, leads, and conversations
- **Subscription Management** - Stripe/Razorpay integration
- **Admin Panel** - User management and monitoring

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Framer Motion
- Zustand (State Management)
- Recharts (Analytics)
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Zod Validation

### Integrations
- OpenAI/Gemini API
- WhatsApp Business API
- Stripe
- Razorpay
- Google OAuth

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd /home/rishu/Project...
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE mj_ai_db;
```

2. Update environment variables:
```bash
cp backend/.env.example backend/.env
# Edit .env with your database credentials
```

3. Generate Prisma client and push schema:
```bash
cd backend
npm run db:generate
npm run db:push
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mj_ai_db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3000"
PORT=5000

# OpenAI
OPENAI_API_KEY="your-openai-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."

# Razorpay (optional)
RAZORPAY_KEY_ID="your-key-id"
RAZORPAY_KEY_SECRET="your-key-secret"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### Running the Application

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Open http://localhost:3000

## Project Structure

```
mj-ai-business-assistant/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── business.ts
│   │   │   ├── leads.ts
│   │   │   ├── messages.ts
│   │   │   ├── settings.ts
│   │   │   ├── appointments.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── analytics.ts
│   │   │   └── webhooks.ts
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├���─ app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── whatsapp/
│   │   │   │   ├── leads/
│   │   │   │   ├── settings/
│   │   │   │   ├── appointments/
│   │   │   │   └── billing/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── avatar.tsx
│   │       ├── dialog.tsx
│   │       ├── switch.tsx
│   │       └── label.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── store/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── SPEC.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Business
- `GET /api/business` - Get business
- `POST /api/business` - Update business
- `POST /api/business/connect-whatsapp` - Connect WhatsApp
- `POST /api/business/disconnect-whatsapp` - Disconnect WhatsApp

### Leads
- `GET /api/leads` - Get leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/export` - Export CSV

### Messages
- `GET /api/messages/:leadId` - Get messages
- `POST /api/messages` - Send message

### AI Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Subscriptions
- `GET /api/subscriptions` - Get subscription
- `POST /api/subscriptions/upgrade` - Upgrade plan
- `POST /api/subscriptions/cancel` - Cancel subscription

### Analytics
- `GET /api/analytics` - Get analytics

### Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp webhook
- `POST /api/webhooks/stripe` - Stripe webhook
- `POST /api/webhooks/razorpay` - Razorpay webhook

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
vercel deploy
```

## Design System

### Colors
- Primary: Emerald (#10B981)
- Secondary: Indigo (#6366F1)
- Accent: Amber (#F59E0B)
- Background: Dark (#0A0A0F) / Light (#F8FAFC)

### Typography
- Headings: Plus Jakarta Sans
- Body: Plus Jakarta Sans

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For support, email support@mjaiassistant.com

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using Next.js, Express, and PostgreSQL