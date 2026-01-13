'use client';

import { useState, useEffect } from 'react';
import { User, Mail, CreditCard, Crown, Calendar, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface UserSettings {
  id: string;
  name: string;
  email: string;
  image: string | null;
  credits: number;
  plan: 'FREE' | 'PRO' | 'ULTRA';
  createdAt: string;
}

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
              Member since {new Date(userSettings.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
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
            <div className={`p-3 rounded-lg ${getPlanColor(userSettings.plan).split(' ')[1]} ${getPlanColor(userSettings.plan).split(' ')[0]}`}>
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
            <p className='text-xs text-muted-foreground mt-4'>
              Upgrade to PRO or ULTRA for more features
            </p>
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
    </div>
  );
}
