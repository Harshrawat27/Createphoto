import { MetadataRoute } from 'next';
import { getPublishedBlogs } from '@/lib/blog';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://picloreai.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/photos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Published blog posts only
  const publishedBlogs = getPublishedBlogs();
  const blogPages: MetadataRoute.Sitemap = publishedBlogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Photo templates
  const photos = await prisma.photoTemplate.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const photoPages: MetadataRoute.Sitemap = photos.map((photo) => ({
    url: `${baseUrl}/photos/${photo.slug}`,
    lastModified: photo.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages, ...photoPages];
}
