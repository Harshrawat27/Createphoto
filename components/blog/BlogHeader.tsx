import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import type { Blog } from '@/lib/blog';

interface BlogHeaderProps {
  blog: Blog;
}

export function BlogHeader({ blog }: BlogHeaderProps) {
  const formattedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className='mb-10'>
      <Link
        href='/blog'
        className='inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6'
      >
        <ArrowLeft className='w-4 h-4' />
        <span>Back to Blog</span>
      </Link>

      <div className='flex flex-wrap items-center gap-3 mb-4'>
        <span className='bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium'>
          {blog.category}
        </span>
        <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <Clock className='w-4 h-4' />
          <span>{blog.readTime}</span>
        </div>
        <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <Calendar className='w-4 h-4' />
          <span>{formattedDate}</span>
        </div>
      </div>

      <h1 className='text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 leading-tight'>
        {blog.title}
      </h1>

      <p className='text-lg text-muted-foreground mb-6'>{blog.description}</p>

      {blog.keywords.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          <Tag className='w-4 h-4 text-muted-foreground' />
          {blog.keywords.map((keyword) => (
            <span
              key={keyword}
              className='text-xs bg-secondary text-muted-foreground px-2 py-1 rounded'
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
