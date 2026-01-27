'use client';

import Link from 'next/link';
import Image from 'next/image';
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className='space-y-4 py-4 flex flex-col h-full bg-secondary/30 text-secondary-foreground border-r border-border'>
      <div className='px-3 py-2 flex-1'>
        <Link href='/dashboard' className='flex items-center pl-3 mb-14'>
          {/* <div className='relative w-12 h-12 mr-4'>
            <Image
              src='/logo.png'
              alt='PicLoreAI Logo'
              fill
              className='object-contain'
            />
          </div> */}
          <h1 className='text-xl font-heading font-bold'>PicLoreAI.</h1>
        </Link>
        <div className='space-y-1'>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
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
      <div className='px-3 py-2'>
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
  );
}
