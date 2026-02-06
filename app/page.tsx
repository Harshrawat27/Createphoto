import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/landing/Navbar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import {
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Clock,
  Star,
} from 'lucide-react';
import prisma from '@/lib/prisma';

async function getLatestTemplates() {
  const templates = await prisma.photoTemplate.findMany({
    select: {
      id: true,
      slug: true,
      imageUrl: true,
      heading: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  return templates;
}

export default async function Home() {
  const templates = await getLatestTemplates();

  // Split templates for different sections
  const heroTemplates = templates.slice(0, 8);
  const galleryTemplates = templates.slice(0, 24);

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      <Navbar />
      <main className='flex-1 w-full'>
        {/* Hero Section */}
        <section className='relative overflow-hidden'>
          {/* Background gradients */}
          <div className='absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50' />
          <div className='absolute top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-50' />

          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-16'>
            <div className='grid lg:grid-cols-2 gap-12 items-center'>
              {/* Left: Text Content */}
              <div className='space-y-8'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary'>
                  <Zap className='w-4 h-4' />
                  <span>AI-Powered Photo Generation</span>
                </div>

                <h1 className='text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground leading-tight'>
                  Professional Photos
                  <br />
                  <span className='text-primary'>Without a Photoshoot</span>
                </h1>

                <p className='text-lg text-muted-foreground leading-relaxed max-w-lg'>
                  Upload a few selfies, get hundreds of stunning professional
                  photos. Perfect for LinkedIn, dating profiles, social media,
                  and more.
                </p>

                {/* Trust Indicators */}
                <div className='flex flex-wrap gap-6 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <Check className='w-5 h-5 text-green-500' />
                    <span>Ready in 30 seconds</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='w-5 h-5 text-green-500' />
                    <span>100+ styles available</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='w-5 h-5 text-green-500' />
                    <span>No subscription required</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/dashboard'
                    className='flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  >
                    <Sparkles className='w-5 h-5' />
                    Create Your Photos
                  </Link>
                  <Link
                    href='/photos'
                    className='flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-4 rounded-xl text-lg font-medium transition-colors'
                  >
                    Browse Templates
                    <ArrowRight className='w-5 h-5' />
                  </Link>
                </div>

                {/* Social Proof */}
                <div className='flex items-center gap-4 pt-4'>
                  <div className='flex -space-x-2'>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className='w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary border-2 border-background'
                      />
                    ))}
                  </div>
                  <div className='text-sm'>
                    <div className='flex items-center gap-1 text-yellow-500'>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className='w-4 h-4 fill-current' />
                      ))}
                    </div>
                    <p className='text-muted-foreground'>
                      Loved by 100+ creators
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Image Gallery Grid */}
              <div className='relative'>
                <div className='grid grid-cols-3 gap-3 md:gap-4'>
                  {heroTemplates.slice(0, 6).map((template, index) => (
                    <Link
                      key={template.id}
                      href={`/photos/${template.slug}`}
                      className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:z-10 ${
                        index === 1 || index === 4 ? 'mt-6' : ''
                      }`}
                    >
                      <div className='aspect-[3/4]'>
                        <Image
                          src={template.imageUrl}
                          alt={template.heading}
                          fill
                          className='object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                      </div>
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                    </Link>
                  ))}
                </div>

                {/* Floating Badge */}
                <div className='absolute -bottom-4 -left-4 bg-background border border-border rounded-xl px-4 py-3 shadow-xl'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center'>
                      <Zap className='w-6 h-6 text-green-500' />
                    </div>
                    <div>
                      <p className='font-bold'>30 Seconds</p>
                      <p className='text-sm text-muted-foreground'>
                        Average creation time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Bar / Trust Section */}
        <section className='py-12 border-y border-border bg-secondary/20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <p className='text-center text-sm text-muted-foreground mb-8'>
              TRUSTED BY PROFESSIONALS FOR
            </p>
            <div className='flex flex-wrap justify-center items-center gap-8 md:gap-16 text-muted-foreground'>
              <div className='flex items-center gap-2 text-lg font-semibold'>
                <span>LinkedIn</span>
              </div>
              <div className='flex items-center gap-2 text-lg font-semibold'>
                <span>Instagram</span>
              </div>
              <div className='flex items-center gap-2 text-lg font-semibold'>
                <span>Dating Apps</span>
              </div>
              <div className='flex items-center gap-2 text-lg font-semibold'>
                <span>Resumes</span>
              </div>
              <div className='flex items-center gap-2 text-lg font-semibold'>
                <span>Portfolios</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className='py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl md:text-4xl font-heading font-bold mb-4'>
                Choose from 100+ Professional Styles
              </h2>
              <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                Browse our template gallery and use any style for your photos.
                From corporate headshots to creative portraits.
              </p>
            </div>

            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3'>
              {galleryTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/photos/${template.slug}`}
                  className='group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
                >
                  <div className='aspect-[3/4]'>
                    <Image
                      src={template.imageUrl}
                      alt={template.heading}
                      fill
                      className='object-cover transition-transform duration-300 group-hover:scale-110'
                    />
                  </div>
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors' />
                </Link>
              ))}
            </div>

            <div className='text-center mt-10'>
              <Link
                href='/photos'
                className='inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-lg'
              >
                View all templates
                <ArrowRight className='w-5 h-5' />
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className='py-20 bg-secondary/30'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid md:grid-cols-3 gap-8'>
              <div className='text-center p-8'>
                <div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6'>
                  <Clock className='w-8 h-8' />
                </div>
                <h3 className='text-xl font-bold mb-3'>Save Hours</h3>
                <p className='text-muted-foreground'>
                  Skip the studio booking, travel, and waiting. Get professional
                  photos in minutes from your couch.
                </p>
              </div>
              <div className='text-center p-8'>
                <div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6'>
                  <Sparkles className='w-8 h-8' />
                </div>
                <h3 className='text-xl font-bold mb-3'>Unlimited Variety</h3>
                <p className='text-muted-foreground'>
                  One photoshoot = one outfit. With AI, get hundreds of
                  different looks, styles, and backgrounds.
                </p>
              </div>
              <div className='text-center p-8'>
                <div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6'>
                  <Shield className='w-8 h-8' />
                </div>
                <h3 className='text-xl font-bold mb-3'>Your Photos, Private</h3>
                <p className='text-muted-foreground'>
                  Your images are encrypted and never shared. Delete anytime.
                  Full control over your data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Pricing */}
        <Pricing />

        {/* Final CTA */}
        <section className='py-24'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='relative rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-20 text-center overflow-hidden shadow-2xl'>
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
              <div className='absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl' />
              <div className='absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl' />

              <div className='relative z-10 space-y-8'>
                <h2 className='text-3xl md:text-5xl font-heading font-bold text-white tracking-tight'>
                  Your best photos are 5 minutes away
                </h2>
                <p className='text-white/80 text-lg md:text-xl max-w-2xl mx-auto'>
                  Join thousands of professionals who upgraded their online
                  presence with AI photography.
                </p>
                <Link
                  href='/dashboard'
                  className='inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 px-10 py-5 rounded-xl text-xl font-bold transition-colors shadow-xl'
                >
                  <Sparkles className='w-6 h-6' />
                  Start Creating Free
                </Link>
                <p className='text-white/60 text-sm'>
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
