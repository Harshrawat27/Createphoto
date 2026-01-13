'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  CreditCard,
  Crown,
  Calendar,
  Loader2,
  AlertCircle,
  Zap,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface UserSettings {
  id: string;
  name: string;
  email: string;
  image: string | null;
  credits: number;
  plan: 'FREE' | 'PRO' | 'ULTRA';
  subscriptionId: string | null;
  createdAt: string;
}

const upgradePlans = [
  {
    name: 'Pro',
    price: '$8',
    period: '/month',
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
    productId: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID,
    features: [
      '200 Credits / month',
      'High Resolution (4K)',
      'Priority Processing',
      'Priority Support',
    ],
  },
  {
    name: 'Ultra',
    price: '$24',
    period: '/month',
    icon: Crown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    productId: process.env.NEXT_PUBLIC_DODO_ULTRA_PRODUCT_ID,
    features: [
      '400 Credits / month',
      'Ultra High Resolution (8K)',
      'Instant Processing',
      'API Access',
      'Custom Models',
      'Dedicated Support (24/7)',
    ],
  },
];

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setUserSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setCancelDialogOpen(false);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          'Your plan has been downgraded to FREE. You can still use your remaining credits!'
        );
        // Refresh user settings to reflect the change
        await fetchUserSettings();
      } else {
        const errorText = await response.text();
        toast.error(`Failed to cancel subscription: ${errorText}`);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpgrade = async (
    productId: string | undefined,
    planName: string
  ) => {
    if (!productId) {
      toast.error('Product ID not configured');
      return;
    }

    setUpgradingPlan(planName);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error('Failed to get checkout URL');
        }
      } else {
        const errorText = await response.text();
        toast.error(`Failed to initiate checkout: ${errorText}`);
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast.error('Failed to start upgrade process. Please try again.');
    } finally {
      setUpgradingPlan(null);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'PRO':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'ULTRA':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-muted-foreground bg-secondary/50 border-border';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'PRO':
      case 'ULTRA':
        return <Crown className='w-4 h-4' />;
      default:
        return <User className='w-4 h-4' />;
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!userSettings) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className='p-8 max-w-4xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-heading font-bold mb-2'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className='bg-card rounded-xl border border-border p-6 shadow-sm'>
        <h2 className='text-xl font-bold mb-6'>Profile Information</h2>

        <div className='flex items-center gap-6 mb-6'>
          {/* Avatar */}
          <div className='relative'>
            {userSettings.image ? (
              <div className='relative w-24 h-24 rounded-full overflow-hidden border-4 border-border'>
                <Image
                  src={userSettings.image}
                  alt={userSettings.name}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-border'>
                <User className='w-12 h-12 text-primary' />
              </div>
            )}
          </div>

          {/* Name and Email */}
          <div className='flex-1'>
            <h3 className='text-2xl font-bold mb-1'>{userSettings.name}</h3>
            <p className='text-muted-foreground flex items-center gap-2'>
              <Mail className='w-4 h-4' />
              {userSettings.email}
            </p>
          </div>
        </div>

        {/* Member Since */}
        <div className='pt-4 border-t border-border'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Calendar className='w-4 h-4' />
            <span>
              Member since{' '}
              {new Date(userSettings.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Credits Card */}
        <div className='bg-card rounded-xl border border-border p-6 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-3 rounded-lg bg-blue-500/10 text-blue-500'>
              <CreditCard className='w-6 h-6' />
            </div>
            <div>
              <h3 className='font-bold text-lg'>Credits</h3>
              <p className='text-xs text-muted-foreground'>Available balance</p>
            </div>
          </div>
          <div className='flex items-baseline gap-2'>
            <span className='text-4xl font-bold text-blue-500'>
              {userSettings.credits}
            </span>
            <span className='text-muted-foreground'>credits</span>
          </div>
        </div>

        {/* Plan Card */}
        <div className='bg-card rounded-xl border border-border p-6 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div
              className={`p-3 rounded-lg ${
                getPlanColor(userSettings.plan).split(' ')[1]
              } ${getPlanColor(userSettings.plan).split(' ')[0]}`}
            >
              {getPlanIcon(userSettings.plan)}
            </div>
            <div>
              <h3 className='font-bold text-lg'>Current Plan</h3>
              <p className='text-xs text-muted-foreground'>Your subscription</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border ${getPlanColor(
                userSettings.plan
              )}`}
            >
              {getPlanIcon(userSettings.plan)}
              {userSettings.plan}
            </span>
          </div>
          {userSettings.plan === 'FREE' && (
            <Dialog
              open={upgradeDialogOpen}
              onOpenChange={setUpgradeDialogOpen}
            >
              <DialogTrigger asChild>
                <button className='text-xs text-primary hover:underline mt-4 flex items-center gap-1'>
                  <Sparkles className='w-3 h-3' />
                  Upgrade to PRO or ULTRA for more features
                </button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl'>
                <DialogHeader>
                  <DialogTitle className='text-2xl'>
                    Upgrade Your Plan
                  </DialogTitle>
                  <DialogDescription>
                    Choose the plan that best fits your needs
                  </DialogDescription>
                </DialogHeader>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                  {upgradePlans.map((plan) => {
                    const Icon = plan.icon;
                    const isUpgrading = upgradingPlan === plan.name;
                    return (
                      <div
                        key={plan.name}
                        className={`relative rounded-xl border-2 ${plan.borderColor} p-6 bg-card hover:shadow-lg transition-all`}
                      >
                        <div className='flex items-center gap-3 mb-4'>
                          <div className={`p-3 rounded-lg ${plan.bgColor}`}>
                            <Icon className={`w-6 h-6 ${plan.color}`} />
                          </div>
                          <div>
                            <h3 className='text-xl font-bold'>{plan.name}</h3>
                            <div className='flex items-baseline gap-1'>
                              <span className='text-2xl font-bold'>
                                {plan.price}
                              </span>
                              <span className='text-sm text-muted-foreground'>
                                {plan.period}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ul className='space-y-3 mb-6'>
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className='flex items-start gap-2 text-sm'
                            >
                              <div className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0' />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() =>
                            handleUpgrade(plan.productId, plan.name)
                          }
                          disabled={isUpgrading}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            plan.name === 'Pro'
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                        >
                          {isUpgrading ? (
                            <span className='flex items-center justify-center gap-2'>
                              <Loader2 className='w-4 h-4 animate-spin' />
                              Processing...
                            </span>
                          ) : (
                            `Upgrade to ${plan.name}`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
          {userSettings.plan !== 'FREE' && userSettings.subscriptionId && (
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <button
                  disabled={isCancelling}
                  className='mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <AlertCircle className='w-4 h-4' />
                      Cancel Subscription
                    </>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className='max-w-md'>
                <DialogHeader>
                  <DialogTitle className='text-xl'>
                    Cancel Subscription
                  </DialogTitle>
                  <DialogDescription className='text-left pt-4'>
                    We'll downgrade your plan to FREE instantly, but don't worry
                    - you'll be able to use all your remaining credits even
                    after cancellation.
                  </DialogDescription>
                </DialogHeader>
                <div className='flex flex-col gap-3 mt-4'>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className='w-full py-3 px-4 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isCancelling ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Processing...
                      </span>
                    ) : (
                      'Yes, Cancel My Subscription'
                    )}
                  </button>
                  <button
                    onClick={() => setCancelDialogOpen(false)}
                    disabled={isCancelling}
                    className='w-full py-3 px-4 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50'
                  >
                    Keep My Subscription
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Plan Features (if on paid plan) */}
      {userSettings.plan !== 'FREE' && (
        <div className='bg-card rounded-xl border border-border p-6 shadow-sm'>
          <h2 className='text-xl font-bold mb-4'>Plan Benefits</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {userSettings.plan === 'PRO' && (
              <>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <div>
                    <p className='font-medium'>200 Credits per month</p>
                    <p className='text-xs text-muted-foreground'>
                      Renewed monthly
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <div>
                    <p className='font-medium'>High Resolution (4K)</p>
                    <p className='text-xs text-muted-foreground'>
                      Premium quality
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <div>
                    <p className='font-medium'>Priority Processing</p>
                    <p className='text-xs text-muted-foreground'>
                      Faster generation
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <div>
                    <p className='font-medium'>Priority Support</p>
                    <p className='text-xs text-muted-foreground'>
                      Get help faster
                    </p>
                  </div>
                </div>
              </>
            )}
            {userSettings.plan === 'ULTRA' && (
              <>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-purple-500 mt-2' />
                  <div>
                    <p className='font-medium'>400 Credits per month</p>
                    <p className='text-xs text-muted-foreground'>
                      Renewed monthly
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-purple-500 mt-2' />
                  <div>
                    <p className='font-medium'>Ultra High Resolution (8K)</p>
                    <p className='text-xs text-muted-foreground'>
                      Maximum quality
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-purple-500 mt-2' />
                  <div>
                    <p className='font-medium'>Instant Processing</p>
                    <p className='text-xs text-muted-foreground'>
                      Highest priority
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-purple-500 mt-2' />
                  <div>
                    <p className='font-medium'>API Access</p>
                    <p className='text-xs text-muted-foreground'>
                      Developer features
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-purple-500 mt-2' />
                  <div>
                    <p className='font-medium'>Custom Models</p>
                    <p className='text-xs text-muted-foreground'>
                      Unlimited training
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-purple-500 mt-2' />
                  <div>
                    <p className='font-medium'>Dedicated Support</p>
                    <p className='text-xs text-muted-foreground'>
                      24/7 priority help
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
