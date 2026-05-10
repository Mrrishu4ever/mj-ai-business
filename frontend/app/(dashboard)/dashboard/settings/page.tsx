'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Brain, MessageSquare, Clock, Languages, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { settingsApi, businessApi } from '@/lib/api';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { business, setBusiness, settings, setSettings } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    isEnabled: true,
    tone: 'professional',
    greetingMessage: 'Hi! Thanks for reaching out. How can I help you?',
    customInstructions: '',
    autoReplyDelay: 0,
    businessName: '',
    pricing: '',
    services: '',
    language: 'en',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const [settingsRes, businessRes] = await Promise.all([
          settingsApi.get(),
          businessApi.get()
        ]);

        setSettings(settingsRes.data);
        setBusiness(businessRes.data);

        if (settingsRes.data) {
          setFormData({
            isEnabled: settingsRes.data.isEnabled ?? true,
            tone: settingsRes.data.tone ?? 'professional',
            greetingMessage: settingsRes.data.greetingMessage ?? 'Hi! Thanks for reaching out. How can I help you?',
            customInstructions: settingsRes.data.customInstructions ?? '',
            autoReplyDelay: settingsRes.data.autoReplyDelay ?? 0,
            businessName: settingsRes.data.businessName ?? '',
            pricing: settingsRes.data.pricing ?? '',
            services: settingsRes.data.services ?? '',
            language: settingsRes.data.language ?? 'en',
          });
        }

        if (businessRes.data) {
          setFormData(prev => ({
            ...prev,
            businessName: businessRes.data.name || prev.businessName
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, [setSettings, setBusiness, router]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');

    try {
      const { data } = await settingsApi.update({
        ...formData,
      });
      setSettings(data);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Settings</h1>
          <p className="text-muted-foreground">Configure your AI assistant</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-3">
          {success}
        </div>
      )}

      {/* AI Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Auto Reply</h3>
                <p className="text-sm text-muted-foreground">
                  Enable AI to automatically respond to messages
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tone & Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Response Settings
            </CardTitle>
            <CardDescription>Configure how AI responds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>AI Tone</Label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background px-3"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background px-3"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Auto Reply Delay (seconds)</Label>
              <Input
                type="number"
                min="0"
                value={formData.autoReplyDelay}
                onChange={(e) => setFormData({ ...formData, autoReplyDelay: parseInt(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Business Information
            </CardTitle>
            <CardDescription>Info for AI to use in responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your Business Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Pricing</Label>
              <Input
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                placeholder="$99, $299, etc"
              />
            </div>
            <div className="space-y-2">
              <Label>Services (comma separated)</Label>
              <Input
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                placeholder="Web Design, SEO, Marketing"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Messages</CardTitle>
          <CardDescription>Set greeting and instructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Greeting Message</Label>
            <Input
              value={formData.greetingMessage}
              onChange={(e) => setFormData({ ...formData, greetingMessage: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Custom Instructions</Label>
            <textarea
              className="flex w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={formData.customInstructions}
              onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
              placeholder="Additional instructions for the AI..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}