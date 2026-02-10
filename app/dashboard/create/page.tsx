'use client';

import { useState } from 'react';
import { CreationControls } from '@/components/dashboard/create/CreationControls';
import { ResultsGallery } from '@/components/dashboard/create/ResultsGallery';
import { MobileResultsSheet } from '@/components/dashboard/create/MobileResultsSheet';
import { Toaster } from '@/components/ui/sonner';

interface GenerationResult {
  images: any[];
  expectedCount: number;
}

export default function CreatePage() {
  const [newImages, setNewImages] = useState<any[]>([]);
  const [allSessionImages, setAllSessionImages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expectedCount, setExpectedCount] = useState(0);

  const handleGenerateStart = (count: number) => {
    setIsGenerating(true);
    setExpectedCount(count);
  };

  const handleGenerateComplete = (result: GenerationResult) => {
    setIsGenerating(false);
    setNewImages(result.images);
    setAllSessionImages((prev) => [...result.images, ...prev]);
    setExpectedCount(result.expectedCount);
  };

  return (
    <>
      <div className='flex h-[calc(100vh-65px)] overflow-hidden'>
        {/* Left Panel: Controls */}
        <div className='w-full md:w-100 lg:w-100 border-r border-border bg-card h-full shrink-0'>
          <CreationControls
            onGenerateStart={handleGenerateStart}
            onGenerateComplete={handleGenerateComplete}
          />
        </div>

        {/* Right Panel: Results - Hidden on mobile */}
        <div className='hidden md:block flex-1 bg-secondary/10 h-full'>
          <ResultsGallery
            newImages={newImages}
            isGenerating={isGenerating}
            expectedCount={expectedCount}
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <MobileResultsSheet
        images={allSessionImages}
        isGenerating={isGenerating}
        expectedCount={expectedCount}
      />

      <Toaster />
    </>
  );
}
