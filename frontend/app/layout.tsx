import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MJ AI Business Assistant - AI-Powered WhatsApp Automation',
  description: 'Automate your WhatsApp Business communication with AI. Generate leads, bookings, and provide instant customer support.',
  keywords: ['WhatsApp Business', 'AI Assistant', 'Automation', 'Customer Support', 'Lead Generation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}