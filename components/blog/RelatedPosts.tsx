import { BlogCard } from './BlogCard';
import type { Blog } from '@/lib/blog';

interface RelatedPostsProps {
  posts: Blog[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className='mt-16 pt-10 border-t border-border'>
      <h2 className='text-2xl font-heading font-bold mb-6'>Related Articles</h2>
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {posts.map((post) => (
          <BlogCard key={post.slug} blog={post} />
        ))}
      </div>
    </section>
  );
}
