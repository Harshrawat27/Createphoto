'use client';

import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for individuals wanting to try AI photography.',
    features: [
      '50 Credits',
      'High Resolution (4K)',
      'Community Support',
      'Nano Banana Pro',
    ],
    cta: 'Get Started Free',
    icon: Sparkles,
    highlighted: false,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    productId: null,
    plan: 'FREE',
  },
  {
    name: 'Pro',
    price: '$10',
    description: 'For creators needing more power and flexibility.',
    features: [
      '300 Credits / month',
      'High Resolution (4K)',
      'Priority Processing',
      'Priority Support',
      'Nano Banana Pro',
    ],
    cta: 'Upgrade to Pro',
    icon: Zap,
    highlighted: true,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
    productId: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID,
    plan: 'PRO',
  },
  {
    name: 'Ultra',
    price: '$24',
    description: 'Maximum power for professional creators and agencies.',
    features: [
      '1000 Credits / month',
      'High Resolution (4K)',
      'Priority Processing',
      'Priority Support',
      'Nano Banana Pro',
    ],
    cta: 'Go Ultra',
    icon: Crown,
    highlighted: false,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    productId: process.env.NEXT_PUBLIC_DODO_ULTRA_PRODUCT_ID,
    plan: 'ULTRA',
  },
];

export function Pricing() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/get-session')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.session);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handlePlanClick = async (tier: (typeof tiers)[0]) => {
    // Free plan - redirect to dashboard or login
    if (tier.plan === 'FREE') {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    // Paid plans - check auth first
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If authenticated and paid plan, initiate checkout
    if (!tier.productId) {
      toast.error('Product ID not configured');
      return;
    }

    setLoading(tier.plan);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: tier.productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <section id='pricing' className='py-24 relative overflow-hidden'>
      {/* Background gradients */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[500px] bg-primary/5 rounded-full blur-3xl -z-10' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <h2 className='text-3xl md:text-5xl font-heading font-bold mb-6'>
            Simple, transparent pricing
          </h2>
          <p className='text-muted-foreground text-lg'>
            Choose the perfect plan for your creative journey. No hidden fees.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-stretch'>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`
                relative rounded-2xl p-8 border transition-all duration-300 flex flex-col
                ${
                  tier.highlighted
                    ? 'bg-card shadow-2xl ring-2 ring-primary border-primary z-10 md:scale-110 my-8 md:my-0'
                    : 'bg-card/50 backdrop-blur border-border hover:border-primary/50 md:my-4'
                }
              `}
            >
              {tier.highlighted && (
                <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg z-20'>
                  Most Popular
                </div>
              )}

              <div className='flex-1 flex flex-col'>
                <div
                  className={`w-12 h-12 rounded-lg ${tier.bgColor} ${tier.color} flex items-center justify-center mb-6`}
                >
                  <tier.icon className='w-6 h-6' />
                </div>

                <h3 className='text-2xl font-bold mb-2'>{tier.name}</h3>
                <div className='flex items-baseline gap-1 mb-4'>
                  <span className='text-4xl font-bold'>{tier.price}</span>
                  <span className='text-muted-foreground'>/month</span>
                </div>
                <p className='text-muted-foreground mb-8 text-sm leading-relaxed'>
                  {tier.description}
                </p>

                <ul className='space-y-4 mb-8 flex-1'>
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className='flex items-start gap-3 text-sm'
                    >
                      <Check
                        className={`w-5 h-5 flex-shrink-0 ${tier.color}`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(tier)}
                  disabled={loading === tier.plan}
                  className={`
                    w-full py-3 rounded-xl font-bold transition-all mt-auto disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      tier.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 button-highlighted-shadow'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }
                  `}
                >
                  {loading === tier.plan ? 'Loading...' : tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
