'use client';

import { useEffect, useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, MessageSquare, AlertCircle, Wifi, RefreshCw, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Use environment variable or fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function WhatsAppPage() {
  const [status, setStatus] = useState('LOADING');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchQR = async () => {
    try {
      const res = await fetch(`${API_URL}/api/qr`);
      const data = await res.json();
      if (data.qr) {
        // Generate QR image URL from QR string
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qr)}`;
        setQrCode(qrUrl);
      }
      if (data.status) {
        setStatus(data.status);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching QR:', err);
      setError('Cannot connect to WhatsApp server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/status`);
      const data = await res.json();
      setStatus(data.status || 'DISCONNECTED');
      if (data.status === 'CONNECTED') {
        setQrCode(null);
      }
    } catch (err) {
      setError('Cannot connect to WhatsApp server');
    }
  };

  useEffect(() => {
    fetchQR();
    fetchStatus();

    const interval = setInterval(() => {
      fetchStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQR();
  };

  const isConnected = status === 'CONNECTED';
  const isAuthenticating = status === 'AUTHENTICATING' || status === 'AUTHENTICATED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Connection</h1>
          <p className="text-muted-foreground">Connect your WhatsApp for AI auto-reply</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          isConnected ? 'bg-emerald-500/20 text-emerald-400' :
          isAuthenticating ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-400' :
            isAuthenticating ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`} />
          <span className="text-sm font-medium">{status}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
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
                    <p className="text-sm text-muted-foreground">WhatsApp Active - AI Auto-reply On</p>
                  </div>
                </>
              ) : isAuthenticating ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-400">{status}</p>
                    <p className="text-sm text-muted-foreground">Scan QR below to connect</p>
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
                <p className="text-sm text-muted-foreground">Open WhatsApp on phone</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                <p className="text-sm text-muted-foreground">Settings → Linked Devices</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                <p className="text-sm text-muted-foreground">Scan QR Code below</p>
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
            {isConnected ? 'Connected - AI Auto-reply Active' : 'Scan with WhatsApp to connect'}
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
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-72 h-72" />
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="mt-4">
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh QR
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating QR...</p>
              <Button onClick={handleRefresh} disabled={refreshing} className="mt-4">
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}