'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useSession, authClient } from '@/lib/auth-client';

export function Navbar() {
  const session = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className='border-b bg-background/80 backdrop-blur-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center gap-2'>
            <Link href='/' className='flex items-center gap-2 group'>
              {/* <div className='relative w-12 h-12 group-hover:opacity-90 transition-opacity'>
                <Image
                  src='/logo.png'
                  alt='PicLoreAI Logo'
                  fill
                  className='object-contain'
                />
              </div> */}
              <span className='font-heading text-xl font-bold tracking-tight'>
                PicLoreAI.
              </span>
            </Link>
          </div>

          <div className='hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground'>
            <Link
              href='#features'
              className='hover:text-primary transition-colors'
            >
              Features
            </Link>
            <Link
              href='#how-it-works'
              className='hover:text-primary transition-colors'
            >
              How it Works
            </Link>
            <Link
              href='#pricing'
              className='hover:text-primary transition-colors'
            >
              Pricing
            </Link>
            <Link href='/blog' className='hover:text-primary transition-colors'>
              Blog
            </Link>
          </div>

          <div className='flex items-center gap-4'>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
            >
              {mobileMenuOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </button>
            <ThemeToggle />
            {session.isPending ? (
              <div className='h-8 w-20 bg-muted animate-pulse rounded-md' />
            ) : session.data?.user ? (
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  {session.data.user.image ? (
                    <img
                      src={session.data.user.image}
                      alt={session.data.user.name || 'User'}
                      className='w-8 h-8 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center'>
                      <User className='w-4 h-4 text-primary' />
                    </div>
                  )}
                  <span className='hidden md:block text-sm font-medium text-foreground'>
                    {session.data.user.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <Link
                  href='/dashboard'
                  className='bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors button-highlighted-shadow'
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          window.location.href = '/';
                        },
                      },
                    });
                  }}
                  className='p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
                  title='Sign Out'
                >
                  <LogOut className='w-4 h-4' />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href='/login'
                  className='hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
                >
                  Sign In
                </Link>
                <Link
                  href='/login'
                  className='bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors button-highlighted-shadow'
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t border-border bg-background absolute w-full'>
          <div className='px-4 py-4 space-y-3'>
            <Link
              href='#features'
              onClick={() => setMobileMenuOpen(false)}
              className='block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2'
            >
              Features
            </Link>
            <Link
              href='#how-it-works'
              onClick={() => setMobileMenuOpen(false)}
              className='block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2'
            >
              How it Works
            </Link>
            <Link
              href='#pricing'
              onClick={() => setMobileMenuOpen(false)}
              className='block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2'
            >
              Pricing
            </Link>
            <Link
              href='/blog'
              onClick={() => setMobileMenuOpen(false)}
              className='block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2'
            >
              Blog
            </Link>
            <Link
              href='/photos'
              onClick={() => setMobileMenuOpen(false)}
              className='block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2'
            >
              Templates
            </Link>
            {!session.data?.user && (
              <Link
                href='/login'
                onClick={() => setMobileMenuOpen(false)}
                className='block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2'
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
