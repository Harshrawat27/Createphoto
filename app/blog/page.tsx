import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BlogCard } from '@/components/blog/BlogCard';
import { getPublishedBlogs, getFeaturedBlogs } from '@/lib/blog';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - PicLoreAI | AI Headshot Tips & Professional Photography Guide',
  description:
    'Expert tips on AI headshots, LinkedIn photos, professional photography, and personal branding. Learn how to look professional in photos and build your visual brand.',
  openGraph: {
    title: 'Blog - PicLoreAI',
    description:
      'Expert tips on AI headshots, LinkedIn photos, and professional photography.',
    type: 'website',
  },
};

export default function BlogPage() {
  const publishedBlogs = getPublishedBlogs();
  const featuredBlogs = getFeaturedBlogs();
  const regularBlogs = publishedBlogs.filter((blog) => !blog.featured);

  // If no published blogs, show coming soon
  if (publishedBlogs.length === 0) {
    return (
      <div className='min-h-screen bg-background'>
        <Navbar />
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='text-center py-20'>
            <div className='w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6'>
              <BookOpen className='w-8 h-8 text-primary' />
            </div>
            <h1 className='text-4xl font-heading font-bold mb-4'>Blog Coming Soon</h1>
            <p className='text-muted-foreground text-lg max-w-md mx-auto'>
              We're working on amazing content about AI headshots, professional
              photography, and personal branding. Check back soon!
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-5xl font-heading font-bold mb-4'>
            The PicLoreAI Blog
          </h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Expert tips on AI headshots, professional photography, and building your
            visual personal brand. Learn how to look your best in every photo.
          </p>
        </div>

        {/* Featured Posts */}
        {featuredBlogs.length > 0 && (
          <section className='mb-16'>
            <h2 className='text-2xl font-heading font-bold mb-6'>Featured Articles</h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog.slug} blog={blog} featured />
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        {regularBlogs.length > 0 && (
          <section>
            <h2 className='text-2xl font-heading font-bold mb-6'>All Articles</h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {regularBlogs.map((blog) => (
                <BlogCard key={blog.slug} blog={blog} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className='mt-20 text-center py-16 px-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl'>
          <h2 className='text-2xl font-heading font-bold mb-3'>
            Get Professional Photo Tips in Your Inbox
          </h2>
          <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
            Join thousands of professionals who get our weekly tips on looking great in
            photos and building their personal brand.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto'>
            <input
              type='email'
              placeholder='Enter your email'
              className='flex-1 px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50'
            />
            <button className='bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition-colors'>
              Subscribe
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
