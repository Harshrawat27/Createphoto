import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Sparkles, Tag as TagIcon, Wand2 } from 'lucide-react';
import prisma from '@/lib/prisma';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getTagBySlug(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });
  return tag;
}

async function getTemplatesByTag(tagId: string) {
  const templates = await prisma.photoTemplate.findMany({
    where: {
      tags: {
        some: {
          tagId: tagId,
        },
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return templates.map((template) => ({
    ...template,
    tags: template.tags.map((t) => t.tag),
  }));
}

async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
  return tags;
}

export async function generateStaticParams() {
  const tags = await prisma.tag.findMany({
    select: { slug: true },
  });
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return {
      title: 'Category Not Found - PicLoreAI',
    };
  }

  const baseUrl = 'https://www.picloreai.com';

  return {
    title: `${tag.name} AI Photo Templates - Generate ${tag.name} Photos | PicLoreAI`,
    description: `Browse our collection of ${tag.name.toLowerCase()} AI photo templates. Use these prompts to generate stunning ${tag.name.toLowerCase()} photos with your trained AI model.`,
    keywords: [
      `${tag.name} AI photos`,
      `${tag.name} templates`,
      `${tag.name} headshots`,
      'AI photo generation',
      'AI photography',
      tag.name,
    ],
    alternates: {
      canonical: `${baseUrl}/photos/category/${slug}`,
    },
    openGraph: {
      title: `${tag.name} AI Photo Templates - PicLoreAI`,
      description: `Generate stunning ${tag.name.toLowerCase()} AI photos with our template collection.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tag.name} AI Photo Templates - PicLoreAI`,
      description: `Generate stunning ${tag.name.toLowerCase()} AI photos with our template collection.`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const templates = await getTemplatesByTag(tag.id);
  const allTags = await getAllTags();

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      <Navbar />

      <main className='flex-1 w-full'>
        {/* Hero Section */}
        <section className='py-12 md:py-16 bg-secondary/20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-8'>
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6'>
                <TagIcon className='w-4 h-4' />
                <span className='font-medium'>{tag.name}</span>
              </div>
              <h1 className='text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4'>
                {tag.name} AI Photo Templates
              </h1>
              <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                Browse {templates.length} {tag.name.toLowerCase()} templates.
                Use any of these with your trained AI model to generate stunning
                photos.
              </p>
            </div>

            {/* CTA */}
            <div className='flex justify-center'>
              <Link
                href='/dashboard'
                className='inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg'
              >
                <Sparkles className='w-5 h-5' />
                Start Creating Photos
              </Link>
            </div>
          </div>
        </section>

        {/* Tags Filter */}
        <section className='py-6 border-b border-border'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-wrap gap-2 justify-center'>
              <Link
                href='/photos'
                className='px-4 py-2 rounded-full text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors'
              >
                All
              </Link>
              {allTags.slice(0, 15).map((t) => (
                <Link
                  key={t.id}
                  href={`/photos/category/${t.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    t.id === tag.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className='py-12'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {templates.length === 0 ? (
              <div className='text-center py-20'>
                <p className='text-muted-foreground text-lg'>
                  No templates found for this category.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>
                {templates.map((template) => (
                  <div key={template.id} className='group block relative'>
                    <div className='relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary/30 shadow-lg'>
                      <Image
                        src={template.imageUrl}
                        alt={template.heading}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                      />

                      {/* Full card link - goes to detail page */}
                      <Link
                        href={`/photos/${template.slug}`}
                        className='absolute inset-0 z-[1]'
                        aria-label={`View ${template.heading}`}
                      />

                      {/* Hover Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
                        <div className='absolute bottom-0 left-0 right-0 p-4 pointer-events-auto'>
                          {/* Template Title */}
                          <p className='text-white text-sm font-medium mb-3 line-clamp-2'>
                            {template.heading}
                          </p>

                          {/* Use Template Button */}
                          <Link
                            href={`/dashboard/create?template=${template.slug}`}
                            className='relative z-[2] w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                          >
                            <Wand2 className='w-4 h-4' />
                            Use Template
                          </Link>
                        </div>
                      </div>

                      {/* Always visible title at bottom */}
                      <div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-0 transition-opacity duration-300 pointer-events-none'>
                        <h3 className='text-white text-sm font-medium line-clamp-2'>
                          {template.heading}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-24'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='relative rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-20 text-center overflow-hidden shadow-2xl'>
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
              <div className='absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl' />
              <div className='absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl' />

              <div className='relative z-10 space-y-8'>
                <h2 className='text-3xl md:text-5xl font-heading font-bold text-white tracking-tight'>
                  Create {tag.name} Photos with AI
                </h2>
                <p className='text-white/80 text-lg md:text-xl max-w-2xl mx-auto'>
                  Upload your selfies, train your personal AI model, and
                  generate unlimited {tag.name.toLowerCase()} photos in minutes.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                  <Link
                    href='/dashboard'
                    className='w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-bold transition-colors shadow-xl'
                  >
                    <Sparkles className='w-5 h-5' />
                    Start Creating Free
                  </Link>
                </div>
                <p className='text-white/60 text-sm'>
                  No credit card required. Generate your first photos in
                  minutes.
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
