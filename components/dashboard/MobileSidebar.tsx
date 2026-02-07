'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  PlusCircle,
  Image as ImageIcon,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

const routes = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Create Images',
    icon: PlusCircle,
    href: '/dashboard/create',
    color: 'text-primary',
  },
  {
    label: 'My Models',
    icon: User,
    href: '/dashboard/models',
    color: 'text-pink-700',
  },
  {
    label: 'Gallery',
    icon: ImageIcon,
    href: '/dashboard/gallery',
    color: 'text-emerald-500',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <div className='md:hidden flex items-center gap-3'>
        <button
          onClick={() => setIsOpen(true)}
          className='p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
        >
          <Menu className='w-5 h-5' />
        </button>
        <Link href='/dashboard' className='font-heading text-lg font-bold'>
          PicLoreAI.
        </Link>
      </div>

      {/* Overlay + Slide-out Menu - only render when open */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className='fixed inset-0 bg-black/50 z-[90] md:hidden'
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-out Menu */}
          <div className='fixed top-0 left-0 w-72 h-screen bg-background border-r border-border z-[100] md:hidden flex flex-col'>
            {/* Header */}
            <div className='flex-shrink-0 flex items-center justify-between p-4 border-b border-border'>
              <Link
                href='/dashboard'
                onClick={() => setIsOpen(false)}
                className='font-heading text-xl font-bold'
              >
                PicLoreAI.
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className='p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Navigation */}
            <div className='flex-1 px-3 py-4 overflow-y-auto'>
              <div className='space-y-1'>
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                      pathname === route.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground'
                    )}
                  >
                    <div className='flex items-center flex-1'>
                      <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                      {route.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sign Out */}
            <div className='flex-shrink-0 px-3 py-4 border-t border-border'>
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
                className='text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-red-500 hover:bg-red-500/10 rounded-lg transition text-muted-foreground'
              >
                <div className='flex items-center flex-1'>
                  <LogOut className='h-5 w-5 mr-3' />
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
