'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Trash2, RefreshCw, Settings, Users, Send, BarChart3, Power, PowerOff, QrCode, Phone, Mail, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Client {
  clientId: string;
  name: string;
  status: string;
  number?: string;
  qr?: string;
}

export default function AdminPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ clientId: '', name: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messageForm, setMessageForm] = useState({ to: '', message: '' });
  const [sending, setSending] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/clients');
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error('Failed to fetch clients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    const interval = setInterval(fetchClients, 10000);
    return () => clearInterval(interval);
  }, []);

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      await fetch('http://localhost:5001/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });

      setNewClient({ clientId: '', name: '' });
      setModalOpen(false);
      fetchClients();
    } catch (e) {
      console.error('Failed to add client:', e);
    } finally {
      setAddLoading(false);
    }
  };

  const removeClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to remove this number?')) return;

    try {
      await fetch(`http://localhost:5001/api/clients/${clientId}`, { method: 'DELETE' });
      fetchClients();
    } catch (e) {
      console.error('Failed to remove client:', e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setSending(true);
    try {
      await fetch(`http://localhost:5001/api/clients/${selectedClient.clientId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm),
      });

      setMessageForm({ to: '', message: '' });
      alert('Message sent!');
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'AUTHENTICATING':
      case 'AUTHENTICATED':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'DISCONNECTED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MJ AI Admin</h1>
                <p className="text-sm text-muted-foreground">WhatsApp Number Manager</p>
              </div>
            </div>

            <Button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Number
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Numbers</p>
              <p className="text-2xl font-bold">{clients.length}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-2xl font-bold text-emerald-400">
                {clients.filter(c => c.status === 'CONNECTED').length}
              </p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Authenticating</p>
              <p className="text-2xl font-bold text-yellow-400">
                {clients.filter(c => c.status === 'AUTHENTICATING' || c.status === 'AUTHENTICATED').length}
              </p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Disconnected</p>
              <p className="text-2xl font-bold text-red-400">
                {clients.filter(c => c.status === 'DISCONNECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No WhatsApp numbers added yet.</p>
            <Button onClick={() => setModalOpen(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add First Number
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <motion.div
                key={client.clientId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">{client.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {client.clientId}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(client.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${
                      client.status === 'CONNECTED' ? 'text-emerald-400' :
                      client.status === 'AUTHENTICATING' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  {client.number && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Number:</span>
                      <span className="font-mono">{client.number}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                    className="flex-1"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeClient(client.clientId)}
                    className="text-red-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Add WhatsApp Number</h2>

            <form onSubmit={addClient} className="space-y-4">
              <div>
                <Label>Client ID</Label>
                <Input
                  placeholder="e.g., business-2"
                  value={newClient.clientId}
                  onChange={(e) => setNewClient({ ...newClient, clientId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Second Business"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={addLoading} className="flex-1">
                  {addLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Add Number'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Send Message Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">
              Send Message - {selectedClient.name}
            </h2>

            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <Label>To (WhatsApp Number)</Label>
                <Input
                  placeholder="e.g., 919876543210"
                  value={messageForm.to}
                  onChange={(e) => setMessageForm({ ...messageForm, to: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Include country code (91 for India)</p>
              </div>
              <div>
                <Label>Message</Label>
                <textarea
                  className="w-full h-24 px-3 py-2 rounded-lg bg-secondary border-none resize-none"
                  placeholder="Your message..."
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedClient(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={sending} className="flex-1">
                  {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}