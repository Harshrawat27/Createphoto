'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen transition-colors duration-300'>
      {/* Grid Container with dashed border */}
      <div className='max-w-5xl mx-auto min-h-screen border-x border-dashed border-border'>
        {/* Header Section */}
        <header className='border-b border-dashed border-border px-4 py-3 md:px-6 md:py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex flex-row gap-2 items-center'>
              <div className='w-10 h-10 rounded-lg bg-primary flex items-center justify-center'>
                <span className='text-2xl'>📸</span>
              </div>
              <div className='font-heading text-xl md:text-2xl font-bold text-black dark:text-white'>
                PhotoCreate
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero + Features Section (First Fold) */}
        <section className='border-b border-dashed border-border relative'>
          {/* Hero */}
          <div className='px-4 md:px-8 pt-20 pb-16 md:pt-24 md:pb-20 relative overflow-hidden'>
            <div className='max-w-3xl text-center mx-auto relative z-10'>
              <h1 className='font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-foreground mx-auto'>
                Create Your AI Model
                <br />
                <span className='text-primary'>From Your Selfies</span>
              </h1>
              <p className='text-sm md:text-base leading-relaxed mb-6 text-muted-foreground max-w-xl mx-auto'>
                Upload your photos and let AI create a personalized model of yourself.
                Generate stunning images, create an AI influencer, or try on clothes virtually.
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
                <Link href='/upload'>
                  <button
                    className={cn(
                      'px-6 py-2.5 rounded-lg text-sm font-medium',
                      'bg-primary text-primary-foreground',
                      'shadow-md shadow-primary/20 button-highlighted-shadow',
                      'hover:bg-primary/90',
                      'transition-colors duration-200 cursor-pointer'
                    )}
                  >
                    Get Started Free
                  </button>
                </Link>
                <Link href='#features'>
                  <button
                    className={cn(
                      'px-6 py-2.5 rounded-lg text-sm font-medium',
                      'bg-secondary text-secondary-foreground',
                      'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)]',
                      'hover:bg-secondary/80',
                      'transition-colors duration-200 cursor-pointer'
                    )}
                  >
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className='grid md:grid-cols-3 border-t border-dashed border-border' id='features'>
            {/* Feature 1 */}
            <div className='px-4 py-6 md:p-6 md:border-r border-dashed border-border'>
              <div
                className={cn(
                  'w-10 h-10 rounded-lg mb-3',
                  'bg-secondary',
                  'flex items-center justify-center',
                  'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)]'
                )}
              >
                <span className='text-xl'>✏️</span>
              </div>
              <h3 className='font-heading text-base md:text-lg font-bold mb-2 text-foreground'>
                Upload & Train
              </h3>
              <p className='text-xs md:text-sm leading-relaxed text-muted-foreground'>
                Upload 10-20 selfies and create a personalized AI model trained
                specifically on your features.
              </p>
            </div>

            {/* Feature 2 */}
            <div className='px-4 py-6 md:p-6 md:border-r border-dashed border-border'>
              <div
                className={cn(
                  'w-10 h-10 rounded-lg mb-3',
                  'bg-secondary',
                  'flex items-center justify-center',
                  'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)]'
                )}
              >
                <span className='text-xl'>👸</span>
              </div>
              <h3 className='font-heading text-base md:text-lg font-bold mb-2 text-foreground'>
                AI Influencer
              </h3>
              <p className='text-xs md:text-sm leading-relaxed text-muted-foreground'>
                Create a 100% AI influencer for content creation and monetization.
                Perfect for social media and marketing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className='px-4 py-6 md:p-6'>
              <div
                className={cn(
                  'w-10 h-10 rounded-lg mb-3',
                  'bg-secondary',
                  'flex items-center justify-center',
                  'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)]'
                )}
              >
                <span className='text-xl'>👗</span>
              </div>
              <h3 className='font-heading text-base md:text-lg font-bold mb-2 text-foreground'>
                Virtual Try-On
              </h3>
              <p className='text-xs md:text-sm leading-relaxed text-muted-foreground'>
                Try on clothes virtually with your AI model. See how outfits
                look before you buy.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className='border-b border-dashed border-border px-4 md:px-8 py-10 md:py-16'>
          <h2 className='font-heading text-2xl md:text-3xl font-bold mb-8 text-foreground text-center'>
            How It Works
          </h2>
          <div className='grid md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            <div className='text-center'>
              <div className='w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-primary'>1</span>
              </div>
              <h3 className='font-heading text-lg font-bold mb-2 text-foreground'>
                Upload Photos
              </h3>
              <p className='text-sm text-muted-foreground'>
                Upload 10-20 high-quality selfies from different angles
              </p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-primary'>2</span>
              </div>
              <h3 className='font-heading text-lg font-bold mb-2 text-foreground'>
                AI Training
              </h3>
              <p className='text-sm text-muted-foreground'>
                Our AI learns your unique features and creates your model
              </p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-primary'>3</span>
              </div>
              <h3 className='font-heading text-lg font-bold mb-2 text-foreground'>
                Generate Photos
              </h3>
              <p className='text-sm text-muted-foreground'>
                Create unlimited photos in any style, pose, or setting
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='px-4 md:px-8 py-10 md:py-16 text-center'>
          <h2 className='font-heading text-2xl md:text-3xl font-bold mb-3 text-foreground'>
            Ready to create your AI model?
          </h2>
          <p className='text-sm md:text-base mb-6 text-muted-foreground max-w-xl mx-auto'>
            Join thousands creating stunning AI-generated photos. No credit card required to start.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
            <Link href='/signup'>
              <button
                className={cn(
                  'w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium',
                  'bg-primary text-primary-foreground',
                  'shadow-md shadow-primary/20 button-highlighted-shadow',
                  'hover:bg-primary/90',
                  'transition-colors duration-200 cursor-pointer'
                )}
              >
                Start Creating Free
              </button>
            </Link>
            <Link href='/examples'>
              <button
                className={cn(
                  'w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium',
                  'bg-secondary text-secondary-foreground',
                  'shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)]',
                  'hover:bg-secondary/80',
                  'transition-colors duration-200 cursor-pointer'
                )}
              >
                View Examples
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className='border-t border-dashed border-border px-4 md:px-8 py-6 text-center'>
          <p className='text-xs text-muted-foreground mb-2'>
            © {new Date().getFullYear()} PhotoCreate. All rights reserved.
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
    </div>
  );
}
