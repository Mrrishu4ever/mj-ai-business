'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { QrCode, CheckCircle2, XCircle, Loader2, MessageSquare, AlertCircle, Wifi, Zap, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LivePulse, GlassCard } from '@/components/ui/animated';

// Socket.io server URL
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function WhatsAppQR() {
  const [status, setStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // ========== SOCKET CONNECTION ==========
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('📱 Socket connected');
      setLoading(false);
      // Request current status
      socket.emit('get-qr');
    });

    socket.on('disconnect', () => {
      console.log('📱 Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Cannot connect to server');
      setLoading(false);
    });

    // ========== QR EVENT ==========
    socket.on('qr', (qr: string) => {
      console.log('📱 QR received');
      setQrCode(qr);
      setStatus('AUTHENTICATING');
    });

    // ========== STATUS EVENT ==========
    socket.on('status', (data: { status: string; connected: boolean }) => {
      setStatus(data.status);
      if (data.connected) {
        setQrCode(null); // Clear QR when connected
      }
    });

    // ========== CONNECTED EVENT ==========
    socket.on('connected', () => {
      console.log('📱 WhatsApp Connected!');
      setStatus('CONNECTED');
      setQrCode(null);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const isConnected = status === 'CONNECTED';
  const isAuthenticating = status === 'AUTHENTICATING' || status === 'AUTHENTICATED';

  // Manual refresh QR
  const refreshQR = () => {
    socketRef.current?.emit('get-qr');
  };

  // ========== QR DISPLAY ==========
  const renderQR = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Connecting to server...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-red-400">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
          <p className="text-emerald-400 font-semibold text-lg">WhatsApp Connected!</p>
          <p className="text-sm text-muted-foreground mt-2">AI Auto-reply is active</p>
        </div>
      );
    }

    if (!qrCode) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Generating QR Code...</p>
          <Button variant="outline" size="sm" onClick={refreshQR} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      );
    }

    // Render QR Code - whatsapp-web.js sends base64 data URL
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <img
          src={qrCode}
          alt="WhatsApp QR Code"
          className="w-64 h-64 object-contain bg-white rounded-lg border-2 border-white"
        />
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Open WhatsApp → Settings → Linked Devices → Link a Device
        </p>
        <Button variant="outline" size="sm" onClick={refreshQR} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh QR
        </Button>
      </div>
    );
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Connection</h1>
          <p className="text-muted-foreground">Scan QR to enable AI Auto-reply</p>
        </div>
        <LivePulse isActive={isConnected} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Connection Status
            </CardTitle>
            <CardDescription>Current connection state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-emerald-400">Connected</p>
                    <p className="text-sm text-muted-foreground">WhatsApp Business Active</p>
                  </div>
                </>
              ) : isAuthenticating ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-400">{status}</p>
                    <p className="text-sm text-muted-foreground">Scan QR code to connect</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-10 h-10 text-red-400" />
                  <div>
                    <p className="font-semibold">Disconnected</p>
                    <p className="text-sm text-muted-foreground">Scan QR to start</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {!isConnected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                How to Connect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                <p className="text-sm text-muted-foreground">Open WhatsApp on your phone</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                <p className="text-sm text-muted-foreground">Go to Settings → Linked Devices</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                <p className="text-sm text-muted-foreground">Tap "Link a Device"</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                <p className="text-sm text-muted-foreground">Scan the QR code</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </CardTitle>
          <CardDescription>
            {isConnected ? 'Connected' : 'Scan with WhatsApp to connect'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlassCard className="p-2">
            {renderQR()}
          </GlassCard>
        </CardContent>
      </Card>
    </div>
  );
}