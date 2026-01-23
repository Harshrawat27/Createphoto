import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className='bg-secondary/30 border-t border-border pt-16 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
          <div className='col-span-1 md:col-span-1 space-y-4'>
            <Link href='/' className='flex items-center gap-2'>
              <div className='relative w-12 h-12'>
                <Image
                  src='/logo.png'
                  alt='PicLoreAI Logo'
                  fill
                  className='object-contain'
                />
              </div>
              <span className='font-heading text-xl font-bold'>PicLoreAI</span>
            </Link>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              The advanced AI platform for creating personalized models,
              influencers, and professional photography.
            </p>
          </div>

          <div>
            <h4 className='font-bold mb-4'>Product</h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  Features
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  Showcase
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-bold mb-4'>Company</h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  About
                </Link>
              </li>
              <li>
                <Link href='/blog' className='hover:text-primary transition-colors'>
                  Blog
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  Careers
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-bold mb-4'>Legal</h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-primary transition-colors'>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} PicLoreAI. All rights reserved.
          </p>
          <div className='flex items-center gap-4 text-muted-foreground'>
            <Link href='#' className='hover:text-primary transition-colors'>
              <Twitter className='w-5 h-5' />
            </Link>
            <Link href='#' className='hover:text-primary transition-colors'>
              <Github className='w-5 h-5' />
            </Link>
            <Link href='#' className='hover:text-primary transition-colors'>
              <Linkedin className='w-5 h-5' />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
