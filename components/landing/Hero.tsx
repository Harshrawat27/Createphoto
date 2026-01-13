import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <div className='relative overflow-hidden'>
      {/* Background gradients */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50' />
      <div className='absolute top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-50' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24'>
        <div className='text-center space-y-8 max-w-4xl mx-auto'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border backdrop-blur-sm text-sm font-medium text-muted-foreground animate-fadeIn'>
            <span className='flex h-2 w-2 rounded-full bg-green-500 animate-pulse' />
            <span>New: AI Virtual Try-On Available</span>
          </div>

          <h1 className='text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-foreground'>
            Your Personal <span className='text-primary'>AI Photographer</span>
          </h1>

          <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            Upload your selfies to create a personalized AI model. Generate
            professional headshots, try on virtual clothes, or launch your own
            AI influencer career in minutes.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-4'>
            <Link
              href='/dashboard'
              className='w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3.5 rounded-lg text-base font-medium transition-colors button-highlighted-shadow'
            >
              <Sparkles className='w-5 h-5' />
              Create Your Model
            </Link>
            <Link
              href='#how-it-works'
              className='w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3.5 rounded-lg text-base font-medium transition-colors'
            >
              See How It Works
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
        </div>

        {/* Hero Image / Visualization */}
        <div className='mt-16 md:mt-24 relative max-w-5xl mx-auto'>
          <div className='relative rounded-2xl border bg-card/50 backdrop-blur shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] group'>
            <div className='absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]' />

            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='grid grid-cols-3 gap-4 md:gap-8 p-4 md:p-8 w-full h-full items-center'>
                {/* Card 1: Upload Selfies */}
                <div className='bg-background/80 backdrop-blur rounded-xl p-4 md:p-6 border shadow-lg flex flex-col items-center gap-3 md:gap-4 transform rotate-[-6deg] translate-y-4 transition-transform group-hover:rotate-0 group-hover:translate-y-0 duration-500'>
                  <div className='relative w-full aspect-[3/4] rounded-lg overflow-hidden'>
                    <Image
                      src='/selfie-image.png'
                      alt='Upload Selfies'
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='text-center'>
                    <p className='font-bold text-sm md:text-base'>Upload Selfies</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className='hidden md:flex justify-center text-primary'>
                  <ArrowRight className='w-12 h-12' />
                </div>

                {/* Card 2: Generated Result */}
                <div className='col-span-2 md:col-span-1 bg-background/80 backdrop-blur rounded-xl p-4 md:p-6 border shadow-lg flex flex-col items-center gap-3 md:gap-4 transform rotate-[6deg] translate-y-4 transition-transform group-hover:rotate-0 group-hover:translate-y-0 duration-500'>
                  <div className='relative w-full aspect-[3/4] rounded-lg overflow-hidden'>
                    <Image
                      src='/generated.jpg'
                      alt='Studio level images in 4K'
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='text-center'>
                    <p className='font-bold text-sm md:text-base'>
                      Get studio level images in 4K
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
