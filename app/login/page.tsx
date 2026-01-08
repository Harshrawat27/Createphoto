'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className='min-h-screen transition-colors duration-300 bg-background'>
      {/* Header Section */}
      <header className='border-b px-4 py-3 md:px-6 md:py-4'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2 group'>
            <div className='bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors'>
              <Sparkles className='w-5 h-5 text-primary' />
            </div>
            <span className='font-heading text-xl font-bold tracking-tight'>
              PicLoreAI
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Sign In Section */}
      <section className='px-4 md:px-8 py-16 md:py-24'>
        <div className='max-w-md mx-auto'>
          {/* Heading */}
          <div className='text-center mb-8'>
            <h1 className='font-heading text-3xl md:text-4xl font-bold mb-3 text-foreground'>
              Welcome Back!
            </h1>
            <p className='text-sm md:text-base text-muted-foreground'>
              Sign in to continue creating amazing AI photos
            </p>
          </div>

          {/* Sign In Card */}
          <div className='bg-card rounded-lg border p-6 md:p-8 shadow-lg'>
            <h2 className='font-heading text-xl font-semibold mb-6 text-foreground text-center'>
              Sign In to Your Account
            </h2>

            {/* Google Sign In Button */}
            <button
              onClick={async () => {
                await authClient.signIn.social({
                  provider: 'google',
                  callbackURL: '/dashboard',
                });
              }}
              className={cn(
                'w-full flex items-center justify-center gap-3 px-4 py-3',
                'bg-white text-gray-700 rounded-lg',
                'border border-gray-300',
                'hover:bg-gray-50',
                'transition-colors duration-200',
                'font-medium text-sm cursor-pointer'
              )}
            >
              <svg
                className='w-5 h-5'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              Continue with Google
            </button>

            {/* Benefits List */}
            <div className='mt-8 pt-6 border-t border-border'>
              <p className='text-xs text-muted-foreground mb-3 font-medium'>
                What you get with PicLoreAI:
              </p>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>✓</span>
                  <span>Train custom AI models with your photos</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>✓</span>
                  <span>Generate unlimited AI photos</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>✓</span>
                  <span>Multiple aspect ratios and resolutions</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>✓</span>
                  <span>Save and manage your creations</span>
                </li>
              </ul>
            </div>

            {/* Privacy Note */}
            <p className='text-xs text-muted-foreground text-center mt-6'>
              By signing in, you agree to our{' '}
              <Link href='/privacy' className='text-primary hover:underline'>
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* New User */}
          <p className='text-center text-sm text-muted-foreground mt-6'>
            New to PicLoreAI?{' '}
            <Link href='/' className='text-primary hover:underline'>
              Learn more
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t px-4 md:px-8 py-6 text-center mt-auto'>
        <p className='text-xs text-muted-foreground mb-2'>
          © {new Date().getFullYear()} PicLoreAI. All rights reserved.
        </p>
        <div className='flex justify-center gap-4 text-xs'>
          <Link
            href='/privacy'
            className='text-muted-foreground hover:text-primary transition-colors'
          >
            Privacy Policy
          </Link>
          <Link
            href='/terms'
            className='text-muted-foreground hover:text-primary transition-colors'
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
