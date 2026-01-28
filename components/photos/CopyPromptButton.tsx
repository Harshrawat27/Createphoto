'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyPromptButtonProps {
  prompt: string;
}

export function CopyPromptButton({ prompt }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={copyPrompt}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        copied
          ? 'bg-green-500/20 text-green-500'
          : 'bg-primary/10 text-primary hover:bg-primary/20'
      }`}
    >
      {copied ? (
        <>
          <Check className='w-4 h-4' />
          Copied!
        </>
      ) : (
        <>
          <Copy className='w-4 h-4' />
          Copy Prompt
        </>
      )}
    </button>
  );
}
