import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function BlogCTA() {
  return (
    <section className='mt-16 p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl'>
      <div className='flex items-start gap-4'>
        <div className='w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0'>
          <Sparkles className='w-6 h-6 text-primary' />
        </div>
        <div className='flex-1'>
          <h3 className='text-xl font-heading font-bold mb-2'>
            Ready to Create Your AI Headshots?
          </h3>
          <p className='text-muted-foreground mb-4'>
            Generate professional headshots in minutes. Upload a few selfies, and let our
            AI create stunning photos for LinkedIn, your company website, and more.
          </p>
          <Link
            href='/login'
            className='inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg font-medium transition-colors'
          >
            Get Started Free
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  );
}
