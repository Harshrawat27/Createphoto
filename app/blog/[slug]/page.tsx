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

const BASE_URL = 'https://www.picloreai.com';

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
    alternates: {
      canonical: `${BASE_URL}/blog/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: ['PicLoreAI'],
      tags: blog.keywords,
      images: blog.image
        ? [{ url: `${BASE_URL}${blog.image}`, alt: blog.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.description,
      images: blog.image ? [`${BASE_URL}${blog.image}`] : undefined,
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.description,
    datePublished: new Date(blog.publishedAt).toISOString(),
    dateModified: new Date(blog.publishedAt).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'PicLoreAI',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PicLoreAI',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    url: `${BASE_URL}/blog/${blog.slug}`,
    ...(blog.image && { image: `${BASE_URL}${blog.image}` }),
    keywords: blog.keywords.join(', '),
    articleSection: blog.category,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${BASE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: `${BASE_URL}/blog/${blog.slug}`,
      },
    ],
  };

  return (
    <div className='min-h-screen bg-background'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
