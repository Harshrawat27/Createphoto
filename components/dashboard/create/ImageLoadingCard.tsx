'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ImageLoadingCardProps {
  status: 'loading' | 'success' | 'error';
  imageUrl?: string;
  errorMessage?: string;
}

const funnyMessages = [
  "Oops! AI had a brain freeze on this one",
  "The AI took a coffee break mid-generation",
  "This image got lost in the neural network",
  "AI said 'nah' to this one",
  "Pixel gremlins ate this image",
  "The AI blinked and forgot what it was doing",
  "This one vanished into the latent space",
  "AI hallucinated... nothing this time",
];

export function ImageLoadingCard({ status, imageUrl, errorMessage }: ImageLoadingCardProps) {
  const [funnyMessage] = useState(() =>
    funnyMessages[Math.floor(Math.random() * funnyMessages.length)]
  );

  if (status === 'success' && imageUrl) {
    return (
      <div className='relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary/20 border border-border'>
        <img
          src={imageUrl}
          alt='Generated'
          className='w-full h-full object-cover animate-fade-in'
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary/20 border border-border flex flex-col items-center justify-center p-4 text-center'>
        <div className='w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3'>
          <AlertCircle className='w-6 h-6 text-red-500' />
        </div>
        <p className='text-sm text-muted-foreground'>
          {funnyMessage}
        </p>
      </div>
    );
  }

  // Loading state with circular colorful orbs flowing
  return (
    <div className='relative aspect-2/3 rounded-xl overflow-hidden border border-border'>
      <div className='absolute inset-0 orb-container'>
        {/* 10 circular color orbs */}
        <div className='orb orb-1' />
        <div className='orb orb-2' />
        <div className='orb orb-3' />
        <div className='orb orb-4' />
        <div className='orb orb-5' />
        <div className='orb orb-6' />
        <div className='orb orb-7' />
        <div className='orb orb-8' />
        <div className='orb orb-9' />
        <div className='orb orb-10' />
      </div>

      <style jsx>{`
        .orb-container {
          background: #0f0f18;
        }

        .orb {
          position: absolute;
          width: 55%;
          height: 40%;
          border-radius: 50%;
          filter: blur(35px);
          opacity: 0.9;
        }

        .orb-1 {
          background: radial-gradient(circle, #ff6b6b 0%, #ff6b6b88 50%, transparent 70%);
          animation: orbit-1 4s ease-in-out infinite;
        }

        .orb-2 {
          background: radial-gradient(circle, #ffd93d 0%, #ffd93d88 50%, transparent 70%);
          animation: orbit-2 4.5s ease-in-out infinite;
        }

        .orb-3 {
          background: radial-gradient(circle, #6bcb77 0%, #6bcb7788 50%, transparent 70%);
          animation: orbit-3 3.5s ease-in-out infinite;
        }

        .orb-4 {
          background: radial-gradient(circle, #4d96ff 0%, #4d96ff88 50%, transparent 70%);
          animation: orbit-4 5s ease-in-out infinite;
        }

        .orb-5 {
          background: radial-gradient(circle, #9b5de5 0%, #9b5de588 50%, transparent 70%);
          animation: orbit-5 4.2s ease-in-out infinite;
        }

        .orb-6 {
          background: radial-gradient(circle, #f15bb5 0%, #f15bb588 50%, transparent 70%);
          animation: orbit-6 3.8s ease-in-out infinite;
        }

        .orb-7 {
          background: radial-gradient(circle, #00f5d4 0%, #00f5d488 50%, transparent 70%);
          animation: orbit-7 4.8s ease-in-out infinite;
        }

        .orb-8 {
          background: radial-gradient(circle, #ff9f1c 0%, #ff9f1c88 50%, transparent 70%);
          animation: orbit-8 3.2s ease-in-out infinite;
        }

        .orb-9 {
          background: radial-gradient(circle, #00bbf9 0%, #00bbf988 50%, transparent 70%);
          animation: orbit-9 4.6s ease-in-out infinite;
        }

        .orb-10 {
          background: radial-gradient(circle, #e056fd 0%, #e056fd88 50%, transparent 70%);
          animation: orbit-10 3.6s ease-in-out infinite;
        }

        @keyframes orbit-1 {
          0%, 100% { transform: translate(-20%, -10%); }
          50% { transform: translate(60%, 70%); }
        }

        @keyframes orbit-2 {
          0%, 100% { transform: translate(50%, -15%); }
          50% { transform: translate(-10%, 65%); }
        }

        @keyframes orbit-3 {
          0%, 100% { transform: translate(70%, 30%); }
          50% { transform: translate(-15%, 50%); }
        }

        @keyframes orbit-4 {
          0%, 100% { transform: translate(-10%, 75%); }
          50% { transform: translate(55%, -5%); }
        }

        @keyframes orbit-5 {
          0%, 100% { transform: translate(40%, 55%); }
          50% { transform: translate(10%, 10%); }
        }

        @keyframes orbit-6 {
          0%, 100% { transform: translate(65%, 80%); }
          50% { transform: translate(-5%, 25%); }
        }

        @keyframes orbit-7 {
          0%, 100% { transform: translate(-15%, 45%); }
          50% { transform: translate(70%, 60%); }
        }

        @keyframes orbit-8 {
          0%, 100% { transform: translate(55%, 15%); }
          50% { transform: translate(5%, 80%); }
        }

        @keyframes orbit-9 {
          0%, 100% { transform: translate(20%, 85%); }
          50% { transform: translate(45%, 5%); }
        }

        @keyframes orbit-10 {
          0%, 100% { transform: translate(75%, 50%); }
          50% { transform: translate(-10%, 35%); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        :global(.animate-fade-in) {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
