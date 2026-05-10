'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3, MessageSquare, Users, TrendingUp, ArrowRight,
  Calendar, Settings, CreditCard, Zap, Bot, LogOut, Menu, Sun, Moon, Bell, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyticsApi, leadsApi, businessApi, settingsApi } from '@/lib/api';
import { useAppStore } from '@/store';

const stats = [
  { label: 'Total Messages', value: '0', icon: MessageSquare, color: 'text-primary' },
  { label: 'Active Leads', value: '0', icon: Users, color: 'text-cyan-400' },
  { label: 'AI Responses', value: '0', icon: Bot, color: 'text-purple-400' },
  { label: 'Conversations', value: '0', icon: TrendingUp, color: 'text-amber-400' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { business, setBusiness, settings, setSettings } = useAppStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [leadsRes, analyticsRes, businessRes, settingsRes] = await Promise.all([
        leadsApi.getAll(),
        analyticsApi.get({ period: 'week' }),
        businessApi.get(),
        settingsApi.get().catch(() => ({ data: null }))
      ]);

      setLeads(leadsRes.data);
      setAnalytics(analyticsRes.data);
      setBusiness(businessRes.data);
      setSettings(settingsRes.data);

      // Update stats
      stats[0].value = analyticsRes.data?.totals?.messages?.toString() || '0';
      stats[1].value = leadsRes.data?.length?.toString() || '0';
      stats[2].value = analyticsRes.data?.totals?.aiReplies?.toString() || '0';
      stats[3].value = analyticsRes.data?.totals?.conversations?.toString() || '0';
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome to MJ AI!</h1>
          <p className="text-muted-foreground">Here&apos;s your business overview.</p>
        </div>
        <div className="flex items-center gap-2">
          {!business?.isConnected && (
            <Link href="/dashboard/whatsapp">
              <Button>Connect WhatsApp</Button>
            </Link>
          )}
          {business?.isConnected && (
            <Badge variant="success" className="flex items-center gap-2">
              <Zap className="w-3 h-3" /> AI Active
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/whatsapp">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">WhatsApp Chat</h3>
                  <p className="text-sm text-muted-foreground">Manage conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leads">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Leads</h3>
                  <p className="text-sm text-muted-foreground">View & manage leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/settings">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure AI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Your latest customer conversations</CardDescription>
          </div>
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {leads.length > 0 ? (
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {lead.name?.[0] || lead.phone[0]}
                    </div>
                    <div>
                      <p className="font-medium">{lead.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </div>
                  </div>
                  <Badge variant={lead.status === 'NEW' ? 'default' : lead.status === 'CONVERTED' ? 'success' : 'secondary'}>
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No leads yet</p>
              <Link href="/dashboard/whatsapp">
                <Button variant="outline" size="sm" className="mt-3">
                  Connect WhatsApp to get started
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}