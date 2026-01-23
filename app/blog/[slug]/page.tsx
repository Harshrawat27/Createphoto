import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogCTA } from '@/components/blog/BlogCTA';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import {
  getBlogBySlug,
  getBlogContent,
  getRelatedBlogs,
  getPublishedBlogSlugs,
} from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getPublishedBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog || blog.status !== 'published') {
    return {
      title: 'Blog Post Not Found - PicLoreAI',
    };
  }

  return {
    title: `${blog.title} - PicLoreAI Blog`,
    description: blog.description,
    keywords: blog.keywords.join(', '),
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: ['PicLoreAI'],
      tags: blog.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.description,
    },
    robots: blog.status === 'published' ? 'index, follow' : 'noindex, nofollow',
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  // 404 if blog doesn't exist or is not published
  if (!blog || blog.status !== 'published') {
    notFound();
  }

  const content = getBlogContent(slug);
  const relatedPosts = getRelatedBlogs(slug, 3);

  if (!content) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <BlogHeader blog={blog} />
        <BlogContent content={content} />
        <BlogCTA />
        <RelatedPosts posts={relatedPosts} />
      </main>

      <Footer />
    </div>
  );
}
