'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Bot, MessageSquare, Users, Zap, Shield, BarChart3, CheckCircle2, Star, Menu, X, Play, Sparkles, Globe, Clock, Lock, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleBg } from '@/components/ui/particle-bg';

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Responses',
    description: 'Intelligent auto-replies that understand context and deliver human-like conversations.',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Language Support',
    description: 'Automatically detect and respond in 50+ languages seamlessly.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Multiple team members can manage conversations from one unified inbox.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance metrics, response times, and customer satisfaction.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'End-to-end encryption with SOC 2 compliance and GDPR ready.',
  },
  {
    icon: Clock,
    title: '24/7 Automation',
    description: 'Never miss a lead with round-the-clock automated responses.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '0',
    period: 'forever',
    description: 'Perfect for trying things out',
    features: ['100 messages/mo', 'Basic AI responses', '1 team member', 'Email support'],
    popular: false,
  },
  {
    name: 'Professional',
    price: '29',
    period: '/month',
    description: 'For growing businesses',
    features: ['5,000 messages/mo', 'Advanced AI & NLP', '5 team members', 'Priority support', 'Analytics', 'Custom responses'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '99',
    period: '/month',
    description: 'For large teams',
    features: ['Unlimited messages', 'Custom AI models', 'Unlimited seats', '24/7 dedicated support', 'API access', 'Custom integrations'],
    popular: false,
  },
];

const faqs = [
  {
    question: 'How does the AI respond to messages?',
    answer: 'Our AI analyzes incoming messages and generates contextually appropriate responses based on your configured knowledge base and business logic.',
  },
  {
    question: 'Can I customize the AI responses?',
    answer: 'Yes! You can add custom responses, FAQs, and even integrate with your own API for custom logic.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use end-to-end encryption and are SOC 2 compliant. Your data is never shared.',
  },
  {
    question: 'Can I integrate with my existing tools?',
    answer: 'Yes! We integrate with CRMs, helpdesk software, and offer a full API for custom integrations.',
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-1/3 -left-1/4 w-[80%] h-[80%] rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/3 -right-1/4 w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-cyan-500/20 via-violet-500/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[50%] h-[50%] rounded-full bg-gradient-to-r from-violet-500/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </div>

      {/* Particle Background */}
      <ParticleBg />

      {/* Navigation */}
      <motion.nav
        style={{ opacity: heroOpacity, y: heroY }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
              >
                <Bot className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                MJ AI
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">Login</Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-0">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden px-4 py-4 border-t border-border bg-background/95 backdrop-blur"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-muted-foreground"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Login
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Get Started
            </Link>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered WhatsApp Automation
                <motion.span
                  className="ml-2 w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                Automate Your{' '}
                <span className="text-gradient bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                  WhatsApp Business
                </span>{' '}
                with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Connect your WhatsApp and let AI handle customer conversations 24/7.
                Generate leads, bookings, and provide instant support.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/register">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-0 shadow-lg shadow-emerald-500/25"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-border"
                >
                  <Play className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-6 mt-8 text-sm text-muted-foreground justify-center lg:justify-start"
              >
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                  14-day free trial
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                  rotate: [0, 1, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-violet-500/30 blur-3xl rounded-full"
              />
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Live Chat</p>
                      <p className="text-xs text-muted-foreground">AI Assistant</p>
                    </div>
                  </div>
                  <motion.div
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20"
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs text-emerald-400">Online</span>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      AI
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                      <p className="text-sm">Hi! 👋 Thanks for reaching out. How can I help you today?</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-end justify-end"
                  >
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl rounded-tr-md p-4 max-w-[85%]">
                      <p className="text-sm text-white">I'm interested in web development services. What's your pricing?</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      AI
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                      <p className="text-sm mb-2">Great choice! We offer three packages:</p>
                      <div className="space-y-1 text-sm">
                        <p>💎 Starter: $499</p>
                        <p>⭐ Professional: $999</p>
                        <p>🏢 Enterprise: Custom</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="flex items-center justify-center pt-2"
                  >
                    <span className="text-xs text-muted-foreground animate-pulse">typing...</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex justify-center pb-8"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for{' '}
              <span className="text-gradient bg-gradient-to-r from-emerald-400 to-cyan-400">Modern Business</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to automate your WhatsApp and provide exceptional customer experiences.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-dark rounded-xl p-6 border border-white/5 card-lift"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4"
                >
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent{' '}
              <span className="text-gradient bg-gradient-to-r from-emerald-400 to-cyan-400">Pricing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`glass-dark rounded-2xl p-6 border ${
                  plan.popular
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                    : 'border-white/5'
                }`}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 border-0'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked{' '}
              <span className="text-gradient bg-gradient-to-r from-emerald-400 to-cyan-400">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark rounded-xl border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === i ? 'auto' : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-4 text-sm text-muted-foreground">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">MJ AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 MJ AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}