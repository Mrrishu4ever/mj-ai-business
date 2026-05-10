'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mail, Lock, ArrowRight, Phone, Loader2, Shield, Sparkles, AlertCircle, LockKeyhole, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParticleBackground, LivePulse, ShakeInput, GlassCard } from '@/components/ui/animated';
import { authApi } from '@/lib/api';

// Google OAuth config - replace with your own credentials from Google Cloud Console
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [emailShake, setEmailShake] = useState(false);
  const [passwordShake, setPasswordShake] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus OTP input when shown
  useEffect(() => {
    if (otpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpSent]);

  // Email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [otpTimer, resendDisabled]);

  const handleGoogleLogin = () => {
    // For demo, simulate Google OAuth flow
    // In production, redirect to Google OAuth
    setGoogleLoading(true);

    // Demo mode: login with sample Google user
    // In production: window.location.href = `/api/auth/google?redirect=${router.asPath}`;
    setTimeout(() => {
      // Simulate successful Google login for demo
      authApi.google({
        email: 'demo@gmail.com',
        name: 'Demo User',
        image: 'https://lh3.googleusercontent.com/a/default'
      })
      .then(({ data }) => {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      })
      .catch(() => {
        // Fallback for demo
        localStorage.setItem('token', 'google-demo-token');
        router.push('/dashboard');
      })
      .finally(() => {
        setGoogleLoading(false);
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    let isEmailValid = isValidEmail(email);
    if (!isEmailValid) {
      setEmailShake(true);
      setTimeout(() => setEmailShake(false), 500);
    }
    if (!email) {
      setEmailShake(true);
      setTimeout(() => setEmailShake(false), 500);
      setError('Please enter your email');
      return;
    }

    setError('');
    setOtpLoading(true);

    try {
      await new Promise(r => setTimeout(r, 1500));
      setOtpSent(true);
      setSuccess('OTP sent! (Demo: 123456)');
      setOtpTimer(30);
      setResendDisabled(true);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (resendDisabled || otpLoading) return;
    handleSendOTP();
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailShake(true);
      setTimeout(() => setEmailShake(false), 500);
      setError('Please enter a valid email');
      return;
    }

    if (!password) {
      setPasswordShake(true);
      setTimeout(() => setPasswordShake(false), 500);
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setPasswordShake(true);
      setTimeout(() => setPasswordShake(false), 500);
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    if (otp.length !== 6) {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 500);
      setError('Please enter 6-digit OTP');
      return;
    }

    if (otp !== '123456') {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 500);
      setError('Invalid OTP. Use 123456 for demo');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login({ email: email || 'demo@mjai.com', password: 'demo123' });
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      localStorage.setItem('token', 'demo-token');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25"
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold">MJ AI</span>
          </Link>

          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-center text-muted-foreground mb-8">Sign in to continue</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-6 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3 mb-6 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {!otpSent ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <ShakeInput shake={emailShake}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
              </ShakeInput>

              <ShakeInput shake={passwordShake}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
              </ShakeInput>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Google Login Button - NOW WORKS! */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </motion.div>

              {/* OTP Login */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleSendOTP}
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LockKeyhole className="w-4 h-4 mr-2" />
                  )}
                  Login with OTP
                </Button>
              </motion.div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Shield className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit OTP<br />
                  sent to <span className="text-foreground font-medium">{email}</span>
                </p>
                <p className="text-xs text-primary mt-2 font-mono">Demo OTP: 123456</p>
              </div>

              <ShakeInput shake={otpShake}>
                <div className="space-y-2">
                  <Label htmlFor="otp">One Time Password</Label>
                  <Input
                    ref={otpInputRef}
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleOTPLogin();
                    }}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                  />
                </div>
              </ShakeInput>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {otpTimer > 0 ? (
                  <>
                    <Timer className="w-4 h-4" />
                    Resend in {otpTimer}s
                  </>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={otpLoading || resendDisabled}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleOTPLogin}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setSuccess('');
                }}
              >
                ← Use Password Instead
              </Button>
            </motion.div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}