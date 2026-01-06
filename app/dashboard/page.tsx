import Link from 'next/link';
import { PlusCircle, Sparkles, User, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className='p-8 max-w-7xl mx-auto space-y-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-heading font-bold'>Welcome back!</h1>
          <p className='text-muted-foreground'>
            You have 150 credits remaining.
          </p>
        </div>
        <Link href='/dashboard/create'>
          <button className='bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors button-highlighted-shadow'>
            <PlusCircle className='w-5 h-5' />
            Create New Image
          </button>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Quick Stat Cards */}
        <div className='p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='p-3 rounded-lg bg-blue-500/10 text-blue-500'>
              <User className='w-6 h-6' />
            </div>
            <div>
              <h3 className='font-bold'>Active Model</h3>
              <p className='text-sm text-muted-foreground'>
                My Personal Model v1
              </p>
            </div>
          </div>
          <Link
            href='/dashboard/models'
            className='text-sm text-primary hover:underline flex items-center gap-1'
          >
            Manage Models <ArrowRight className='w-4 h-4' />
          </Link>
        </div>

        <div className='p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='p-3 rounded-lg bg-purple-500/10 text-purple-500'>
              <Sparkles className='w-6 h-6' />
            </div>
            <div>
              <h3 className='font-bold'>Total Generations</h3>
              <p className='text-sm text-muted-foreground'>1,248 Images</p>
            </div>
          </div>
          <Link
            href='/dashboard/gallery'
            className='text-sm text-primary hover:underline flex items-center gap-1'
          >
            View Gallery <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>

      <div>
        <h2 className='text-xl font-bold mb-4'>Recent Creations</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className='aspect-2/3 rounded-lg bg-secondary/20 animate-pulse'
            />
          ))}
        </div>
      </div>
    </div>
  );
}
