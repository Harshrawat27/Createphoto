'use client';

import { useMemo } from 'react';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const htmlContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

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
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Escape HTML
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote><p>$1</p></blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr />');

  // Tables
  html = parseTable(html);

  // Unordered lists
  html = parseUnorderedLists(html);

  // Ordered lists
  html = parseOrderedLists(html);

  // Checkboxes
  html = html.replace(
    /- \[ \] (.*$)/gim,
    '<li class="flex items-start gap-2"><span class="w-4 h-4 mt-1 border border-border rounded"></span><span>$1</span></li>'
  );
  html = html.replace(
    /- \[x\] (.*$)/gim,
    '<li class="flex items-start gap-2"><span class="w-4 h-4 mt-1 bg-primary rounded flex items-center justify-center text-xs">✓</span><span>$1</span></li>'
  );

  // Paragraphs - wrap lines that aren't already wrapped
  const lines = html.split('\n');
  const wrappedLines = lines.map((line) => {
    const trimmedLine = line.trim();
    if (
      trimmedLine === '' ||
      trimmedLine.startsWith('<h') ||
      trimmedLine.startsWith('<ul') ||
      trimmedLine.startsWith('<ol') ||
      trimmedLine.startsWith('<li') ||
      trimmedLine.startsWith('</') ||
      trimmedLine.startsWith('<blockquote') ||
      trimmedLine.startsWith('<table') ||
      trimmedLine.startsWith('<tr') ||
      trimmedLine.startsWith('<th') ||
      trimmedLine.startsWith('<td') ||
      trimmedLine.startsWith('<hr') ||
      trimmedLine.startsWith('<pre') ||
      trimmedLine.startsWith('<code')
    ) {
      return line;
    }
    if (trimmedLine) {
      return `<p>${trimmedLine}</p>`;
    }
    return line;
  });

  html = wrappedLines.join('\n');

  // Clean up empty paragraphs and extra whitespace
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function parseTable(html: string): string {
  const tableRegex = /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g;

  return html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow
      .split('|')
      .map((h: string) => h.trim())
      .filter(Boolean);
    const rows = bodyRows
      .trim()
      .split('\n')
      .map((row: string) =>
        row
          .split('|')
          .map((cell: string) => cell.trim())
          .filter(Boolean)
      );

    let tableHtml = '<table><thead><tr>';
    headers.forEach((header: string) => {
      tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    rows.forEach((row: string[]) => {
      tableHtml += '<tr>';
      row.forEach((cell: string) => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
  });
}

function parseUnorderedLists(html: string): string {
  const lines = html.split('\n');
  let inList = false;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^- (.+)$/.test(line.trim());

    if (isListItem && !inList) {
      inList = true;
      result.push('<ul>');
    }

    if (isListItem) {
      const content = line.trim().replace(/^- (.+)$/, '$1');
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

function parseOrderedLists(html: string): string {
  const lines = html.split('\n');
  let inList = false;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^\d+\. (.+)$/.test(line.trim());

    if (isListItem && !inList) {
      inList = true;
      result.push('<ol>');
    }

    if (isListItem) {
      const content = line.trim().replace(/^\d+\. (.+)$/, '$1');
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        result.push('</ol>');
        inList = false;
      }
      result.push(line);
    }
  }

  if (inList) {
    result.push('</ol>');
  }

  return result.join('\n');
}
