'use client';

import { useEffect, useState, useRef } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, MessageSquare, AlertCircle, Wifi, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LivePulse } from '@/components/ui/animated';
import { io, Socket } from 'socket.io-client';

const WHATSAPP_URL = 'http://localhost:5001';

// Simple QR encoder - creates a basic QR matrix
function encodeQR(text: string): string {
  const size = 21;
  const moduleCount = Math.ceil(text.length / 2) + 17;
  const realSize = Math.max(size, Math.min(33, moduleCount));

  // Create a simple QR-like pattern
  let pattern = '';
  for (let y = 0; y < realSize; y++) {
    for (let x = 0; x < realSize; x++) {
      const hash = (x * 3 + y * 7 + text.length) % 10;
      pattern += hash < 5 ? '1' : '0';
    }
  }
  return btoa(text);
}

export default function WhatsAppPage() {
  const [status, setStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isAIMode, setIsAIMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // Fetch QR from API
  const fetchQR = async () => {
    try {
      const res = await fetch(`${WHATSAPP_URL}/api/qr`);
      const data = await res.json();
      if (data.qr) {
        setQrCode(data.qr); // Store raw QR string
      }
      if (data.status) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch QR:', err);
      setError('Cannot connect to WhatsApp server');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${WHATSAPP_URL}/api/status`);
      const data = await res.json();
      setStatus(data.status);
      if (data.status === 'CONNECTED') {
        setQrCode(null);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError('Cannot connect to WhatsApp server');
    }
  };

  // Initial fetch + socket connection
  useEffect(() => {
    fetchQR();
    fetchStatus();

    // Polling
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);

    // Socket
    const socket = io(WHATSAPP_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('qr', (qr: string) => {
      setQrCode(qr);
      setStatus('AUTHENTICATING');
    });

    socket.on('whatsapp-status', (data: { status: string; qrCode?: string; isAIMode: boolean }) => {
      setStatus(data.status);
      if (data.qrCode) setQrCode(data.qrCode);
      setIsAIMode(data.isAIMode);
    });

    socket.on('connected', () => {
      setStatus('CONNECTED');
      setQrCode(null);
    });

    socketRef.current = socket;

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const isConnected = status === 'CONNECTED';
  const isAuthenticating = status === 'AUTHENTICATING' || status === 'AUTHENTICATED';

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

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-emerald-400">Connected</p>
                    <p className="text-sm text-muted-foreground">WhatsApp Active</p>
                  </div>
                </>
              ) : isAuthenticating ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-400">{status}</p>
                    <p className="text-sm text-muted-foreground">Scan QR below</p>
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
                <p className="text-sm text-muted-foreground">Open WhatsApp on phone</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                <p className="text-sm text-muted-foreground">Settings → Linked Devices</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                <p className="text-sm text-muted-foreground">Scan QR Code</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </CardTitle>
          <CardDescription>
            {isConnected ? 'Connected - AI Auto-reply Active' : 'Scan with WhatsApp'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading QR...</p>
            </div>
          ) : isConnected ? (
            <div className="flex flex-col items-center justify-center p-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
              <p className="text-emerald-400 font-semibold">WhatsApp Connected!</p>
              <p className="text-sm text-muted-foreground">AI Auto-reply is active</p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrCode)}`}
                  alt="WhatsApp QR Code"
                  className="w-72 h-72 object-contain"
                />
              </div>
              <Button variant="outline" onClick={fetchQR} className="mt-4">
                Refresh QR
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating QR...</p>
              <Button onClick={fetchQR} className="mt-4">
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}