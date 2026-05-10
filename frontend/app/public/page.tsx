'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, Sparkles, CheckCircle, ArrowRight, Star, Send, Phone, Mail, MapPin, Menu, X, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  {
    title: 'AI WhatsApp Bot',
    description: '24/7 automated customer support with AI-powered responses',
    price: 'From $29/mo',
    icon: MessageSquare,
  },
  {
    title: 'Appointment Booking',
    description: 'Automated scheduling and calendar management',
    price: 'From $19/mo',
    icon: Clock,
  },
  {
    title: 'Lead Management',
    description: 'Capture and organize leads automatically',
    price: 'From $15/mo',
    icon: Sparkles,
  },
];

const reviews = [
  {
    name: 'Rahul Sharma',
    business: 'Tech Solutions',
    text: 'Our customer support improved 10x after using MJ AI!',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    business: 'Fashion Store',
    text: 'Best investment for our business. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Amit Kumar',
    business: 'Restaurant Chain',
    text: 'Instant replies helped us close more leads than ever.',
    rating: 5,
  },
];

export default function CustomerWebsite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">MJ AI Services</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#services" className="text-sm">Services</Link>
              <Link href="#pricing" className="text-sm">Pricing</Link>
              <Link href="#reviews" className="text-sm">Reviews</Link>
              <Link href="#contact" className="text-sm">Contact</Link>
              <Link href="http://localhost:3001/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="http://localhost:3001/register">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-500">Get Started</Button>
              </Link>
            </nav>

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-4 py-4 border-t border-border bg-background/95">
            <Link href="#services" onClick={() => setMenuOpen(false)} className="block py-2">Services</Link>
            <Link href="#pricing" onClick={() => setMenuOpen(false)} className="block py-2">Pricing</Link>
            <Link href="#reviews" onClick={() => setMenuOpen(false)} className="block py-2">Reviews</Link>
            <Link href="#contact" onClick={() => setMenuOpen(false)} className="block py-2">Contact</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm mb-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Business Solutions
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Grow Your Business with{' '}
                <span className="text-gradient">AI WhatsApp</span> Automation
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Transform your WhatsApp into a 24/7 sales assistant.
                Instant replies, lead capture, appointment booking - all automated.
              </p>

              <div className="flex gap-4 justify-center lg:justify-start">
                <Link href="http://localhost:3001/register">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button variant="outline" size="lg">Talk to Us</Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 text-sm justify-center lg:justify-start">
                <div className="flex items-center text-emerald-400">
                  <CheckCircle className="w-4 h-4 mr-2" /> 500+ Businesses
                </div>
                <div className="flex items-center text-emerald-400">
                  <CheckCircle className="w-4 h-4 mr-2" /> 24/7 Support
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-full" />
              <div className="relative glass rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">MJ AI Services</h3>
                  <p className="text-muted-foreground">Your WhatsApp Business Partner</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span>Instant Auto-Replies</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span>Lead Capture</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span>Appointment Booking</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span>Analytics Dashboard</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our <span className="text-gradient">Services</span>
            </h2>
            <p className="text-muted-foreground">Everything you need to automate your business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                  <service.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <p className="text-lg font-bold text-emerald-400">{service.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our <span className="text-gradient">Clients Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="mb-4">"{review.text}"</p>
                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.business}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In <span className="text-gradient">Touch</span>
            </h2>
            <p className="text-muted-foreground">Have questions? We'd love to hear from you!</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-8 text-center"
            >
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleContact} className="glass rounded-xl p-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full h-10 px-3 rounded-lg bg-secondary border-none"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <input
                    type="tel"
                    required
                    className="w-full h-10 px-3 rounded-lg bg-secondary border-none"
                    placeholder="Your phone number"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  required
                  className="w-full h-10 px-3 rounded-lg bg-secondary border-none"
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea
                  required
                  className="w-full h-24 px-3 py-2 rounded-lg bg-secondary border-none resize-none"
                  placeholder="How can we help you?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          )}

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Phone className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <p className="font-medium">+91 98765 43210</p>
            </div>
            <div>
              <Mail className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <p className="font-medium">hello@mjai.business</p>
            </div>
            <div>
              <MapPin className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <p className="font-medium">Mumbai, India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">MJ AI Services</span>
            </div>

            <div className="flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            <p className="text-sm text-muted-foreground">© 2026 MJ AI Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}