import { Sidebar } from '@/components/dashboard/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CreditsDisplay } from '@/components/dashboard/CreditsDisplay';
import { getAuthenticatedUser } from '@/lib/get-user';
import Image from 'next/image';
import { User } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }
  return (
    <div className='h-full relative'>
      <div className='hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background'>
        <Sidebar />
      </div>
      <main className='md:pl-72 h-full bg-background min-h-screen'>
        <header className='flex justify-end items-center p-4 border-b border-border gap-4 bg-background/80 backdrop-blur sticky top-0 z-50'>
          <CreditsDisplay variant='compact' className='hidden sm:block' />
          <div className='w-8 h-8 rounded-full bg-primary/20 border border-primary/50 overflow-hidden flex items-center justify-center'>
            {user.image ? (
              <Image
                src={user.image}
                alt='user image'
                width={32}
                height={32}
                className='object-cover'
              />
            ) : (
              <User className='w-4 h-4 text-primary' />
            )}
          </div>
          <ThemeToggle />
        </header>
        {children}
      </main>
    </div>
  );
}
