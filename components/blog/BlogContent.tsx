'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <article
      className='prose prose-lg prose-invert max-w-none
        prose-headings:font-heading prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-ul:text-muted-foreground prose-ul:my-4
        prose-ol:text-muted-foreground prose-ol:my-4
        prose-li:my-1
        prose-blockquote:border-l-primary prose-blockquote:bg-secondary/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
        prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-secondary prose-pre:border prose-pre:border-border
        prose-table:border-collapse prose-table:w-full
        prose-th:bg-secondary prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-border
        prose-td:p-3 prose-td:border prose-td:border-border prose-td:text-muted-foreground
        prose-hr:border-border prose-hr:my-8
      '
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}

