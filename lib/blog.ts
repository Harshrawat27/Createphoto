import fs from 'fs';
import path from 'path';
import blogsData from '@/data/blogs.json';

export type BlogStatus = 'published' | 'unpublished';

export interface Blog {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  publishedAt: string;
  status: BlogStatus;
  featured: boolean;
  image: string;
  keywords: string[];
}

export interface BlogWithContent extends Blog {
  content: string;
}

// Map slug to file name
const slugToFileMap: Record<string, string> = {
  'professional-headshots-without-photographer': 'blog-01-headshots-without-photographer.md',
  'ai-headshots-vs-professional-photographer': 'blog-02-ai-vs-real-photographer.md',
  'linkedin-photos-more-profile-views': 'blog-03-linkedin-photos-more-views.md',
  'corporate-headshot-guide-hr-managers': 'blog-04-corporate-headshot-guide.md',
  'cheap-headshots-near-me-alternative': 'blog-05-cheap-headshots-alternative.md',
  'linkedin-photo-mistakes-costing-interviews': 'blog-06-linkedin-photo-mistakes.md',
  'how-to-look-professional-in-photos': 'blog-07-how-to-look-professional-in-photos.md',
  'executive-headshot-ideas': 'blog-08-executive-headshot-ideas.md',
  'work-from-home-professional-photo': 'blog-09-work-from-home-professional-photo.md',
  'update-linkedin-photo-how-often': 'blog-10-update-linkedin-photo-how-often.md',
  'what-to-wear-professional-headshot': 'blog-11-what-to-wear-headshot.md',
  'free-vs-paid-ai-headshot-generators': 'blog-12-free-vs-paid-ai-headshots.md',
  'how-ai-headshot-generators-work': 'blog-13-how-ai-headshots-work.md',
  'best-lighting-headshots-at-home': 'blog-14-lighting-headshots-home.md',
  'headshot-background-ideas-colors': 'blog-15-headshot-background-ideas.md',
  'real-estate-agent-headshot-tips': 'blog-16-real-estate-agent-headshots.md',
  'lawyer-headshot-professional': 'blog-17-lawyer-headshot-professional.md',
  'actor-headshot-vs-business-headshot': 'blog-18-actor-vs-business-headshot.md',
  'team-photos-company-website': 'blog-19-team-photos-company-website.md',
  'personal-branding-photos-ideas': 'blog-20-personal-branding-photos.md',
};

export function getAllBlogs(): Blog[] {
  return blogsData.blogs as Blog[];
}

export function getPublishedBlogs(): Blog[] {
  return blogsData.blogs.filter((blog) => blog.status === 'published') as Blog[];
}

export function getFeaturedBlogs(): Blog[] {
  return blogsData.blogs.filter(
    (blog) => blog.status === 'published' && blog.featured
  ) as Blog[];
}

export function getBlogBySlug(slug: string): Blog | undefined {
  return blogsData.blogs.find((blog) => blog.slug === slug) as Blog | undefined;
}

export function getBlogContent(slug: string): string | null {
  const fileName = slugToFileMap[slug];
  if (!fileName) return null;

  const filePath = path.join(process.cwd(), 'content', 'blog', fileName);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // Remove frontmatter (everything between first --- and second ---)
    const contentWithoutFrontmatter = fileContent
      .replace(/^#.*\n/, '') // Remove title
      .replace(/\*\*Meta Description:\*\*.*\n/g, '')
      .replace(/\*\*Target Keyword:\*\*.*\n/g, '')
      .replace(/\*\*URL:\*\*.*\n/g, '')
      .replace(/^---\n/gm, '')
      .trim();

    return contentWithoutFrontmatter;
  } catch {
    return null;
  }
}

export function getBlogWithContent(slug: string): BlogWithContent | null {
  const blog = getBlogBySlug(slug);
  if (!blog) return null;

  const content = getBlogContent(slug);
  if (!content) return null;

  return {
    ...blog,
    content,
  };
}

export function getRelatedBlogs(currentSlug: string, limit: number = 3): Blog[] {
  const currentBlog = getBlogBySlug(currentSlug);
  if (!currentBlog) return [];

  return blogsData.blogs
    .filter(
      (blog) =>
        blog.slug !== currentSlug &&
        blog.status === 'published' &&
        blog.category === currentBlog.category
    )
    .slice(0, limit) as Blog[];
}

export function getBlogsByCategory(category: string): Blog[] {
  return blogsData.blogs.filter(
    (blog) => blog.status === 'published' && blog.category === category
  ) as Blog[];
}

export function getAllCategories(): string[] {
  return blogsData.categories;
}

export function getPublishedBlogSlugs(): string[] {
  return blogsData.blogs
    .filter((blog) => blog.status === 'published')
    .map((blog) => blog.slug);
}
