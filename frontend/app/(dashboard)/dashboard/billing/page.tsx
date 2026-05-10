'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Sparkles, Loader2, AlertTriangle, Zap, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { subscriptionsApi } from '@/lib/api';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    plan: 'FREE',
    features: ['100 messages/mo', 'Basic AI', '1 user seat'],
    messageLimit: 100,
    aiEnabled: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    plan: 'PRO',
    popular: true,
    features: ['1,000 messages/mo', 'Advanced AI', '3 user seats', 'Priority support'],
    messageLimit: 1000,
    aiEnabled: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    plan: 'ENTERPRISE',
    features: ['Unlimited messages', 'Custom AI', '10 user seats', '24/7 support'],
    messageLimit: -1,
    aiEnabled: true,
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { subscription, setSubscription } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const { data } = await subscriptionsApi.get();
        setSubscription(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [setSubscription, router]);

  const handleUpgrade = async (plan: string) => {
    if (plan === subscription?.plan) return;
    setUpgrading(true);
    try {
      await subscriptionsApi.upgrade({ plan, paymentMethod: 'stripe' });
      setSubscription({
        ...subscription,
        plan,
        status: 'ACTIVE'
      } as any);
      alert(`Upgraded to ${plan} plan!`);
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = (subscription as any)?.plan || 'FREE';
  const messageCount = (subscription as any)?.messageCount || 0;
  const messageLimit = (subscription as any)?.messageLimit || 100;
  const isUnlimited = messageLimit === -1;
  const usagePercent = isUnlimited ? 0 : Math.min((messageCount / messageLimit) * 100, 100);
  const isLimitReached = !isUnlimited && messageCount >= messageLimit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground">Manage your subscription</p>
        </div>
        <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'destructive'}>
          {subscription?.status || 'FREE'} - {subscription?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Message Usage */}
      {!loading && (
        <Card className={isLimitReached ? 'border-red-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message Usage This Month
            </CardTitle>
            <CardDescription>
              {isUnlimited ? 'Unlimited messages' : `${messageCount} of ${messageLimit} messages used`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isUnlimited ? (
              <div className="h-2 bg-primary/20 rounded-full">
                <div className="h-2 bg-gradient-to-r from-primary to-cyan-400 rounded-full w-full" />
              </div>
            ) : (
              <>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{messageCount} used</span>
                  <span>{messageLimit - messageCount} remaining</span>
                </div>
              </>
            )}
            {isLimitReached && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                Message limit reached. Upgrade to continue using AI.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.plan;
          const isPopular = plan.popular;

          return (
            <Card key={plan.plan} className={isPopular ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                  {isPopular && !isCurrent && (
                    <Badge variant="default">Popular</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.plan)}
                  disabled={isCurrent || upgrading}
                  variant={isPopular ? 'default' : 'outline'}
                >
                  {upgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isUnlimited ? 'Unlimited' : messageLimit}
                </p>
                <p className="text-xs text-muted-foreground">Messages/month</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {(subscription as any)?.aiEnabled ? 'Advanced' : 'Basic'}
                </p>
                <p className="text-xs text-muted-foreground">AI Features</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {(subscription as any)?.maxSeats || 1}
                </p>
                <p className="text-xs text-muted-foreground">User Seats</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{currentPlan}</p>
                <p className="text-xs text-muted-foreground">Current Plan</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}