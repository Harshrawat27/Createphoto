import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { Blog } from '@/lib/blog';

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export function BlogCard({ blog, featured = false }: BlogCardProps) {
  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (featured) {
    return (
      <Link
        href={`/blog/${blog.slug}`}
        className='group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5'
      >
        <div className='aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 relative'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-6xl opacity-20'>AI</span>
          </div>
          <div className='absolute top-4 left-4'>
            <span className='bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full'>
              Featured
            </span>
          </div>
        </div>
        <div className='p-6'>
          <div className='flex items-center gap-4 text-sm text-muted-foreground mb-3'>
            <span className='bg-secondary px-2 py-1 rounded text-xs font-medium'>
              {blog.category}
            </span>
            <div className='flex items-center gap-1'>
              <Clock className='w-3.5 h-3.5' />
              <span>{blog.readTime}</span>
            </div>
          </div>
          <h2 className='text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors'>
            {blog.title}
          </h2>
          <p className='text-muted-foreground text-sm mb-4 line-clamp-2'>
            {blog.description}
          </p>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <Calendar className='w-3.5 h-3.5' />
              <span>{formattedDate}</span>
            </div>
            <span className='text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all'>
              Read more <ArrowRight className='w-4 h-4' />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className='group block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5'
    >
      <div className='flex items-center gap-4 text-sm text-muted-foreground mb-3'>
        <span className='bg-secondary px-2 py-1 rounded text-xs font-medium'>
          {blog.category}
        </span>
        <div className='flex items-center gap-1'>
          <Clock className='w-3.5 h-3.5' />
          <span>{blog.readTime}</span>
        </div>
      </div>
      <h3 className='text-lg font-heading font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2'>
        {blog.title}
      </h3>
      <p className='text-muted-foreground text-sm mb-4 line-clamp-2'>
        {blog.description}
      </p>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
          <Calendar className='w-3.5 h-3.5' />
          <span>{formattedDate}</span>
        </div>
        <span className='text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all'>
          Read <ArrowRight className='w-4 h-4' />
        </span>
      </div>
    </Link>
  );
}
